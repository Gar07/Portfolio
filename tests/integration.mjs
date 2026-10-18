import assert from 'node:assert/strict';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync, readdirSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';
import { once } from 'node:events';
import { resolve, join } from 'node:path';
import { randomBytes } from 'node:crypto';

const root=resolve(import.meta.dirname,'..');
const php=process.env.PHP_BINARY || 'php';
const directory=mkdtempSync(join(root,'.test-'));
const db='portfolio_test_'+randomBytes(6).toString('hex');
const base='http://localhost:18081/api';
const env={...process.env,PORTFOLIO_ADMIN_USER:'test-admin',PORTFOLIO_ADMIN_PASSWORD:'Test-Portfolio-2026-Only'};
let server, created=false, cookie='', csrf='', checks=0, logs='';
const run=(args,cwd=root) => {
  const result=spawnSync(php,args,{cwd,env,encoding:'utf8'});
  assert.equal(result.status,0,result.stderr || result.stdout);
  return result.stdout;
};
async function request(path,method='GET',data,auth=true,extra={}) {
  const headers={...extra};
  if(auth && cookie) headers.Cookie=cookie;
  let body;
  if(data instanceof FormData) body=data;
  else if(data !== undefined) {headers['Content-Type']='application/json';body=JSON.stringify(data);}
  const res=await fetch(base+path,{method,headers,body});
  const text=await res.text();
  let json;try{json=JSON.parse(text);}catch{json=null;}
  return {res,json,text};
}
function status(response,expected) {assert.equal(response.res.status,expected,response.text);checks++;}
async function signIn(password=env.PORTFOLIO_ADMIN_PASSWORD) {
  const result=await request('/login','POST',{username:env.PORTFOLIO_ADMIN_USER,password},false);
  status(result,200);
  const header=result.res.headers.get('set-cookie');
  assert.match(header,/HttpOnly/i);assert.match(header,/SameSite=Strict/i);assert.match(header,/path=\/api/i);
  cookie=header.split(';')[0]; csrf=result.json.token;return result;
}
try {
  cpSync(join(root,'backend'),join(directory,'backend'),{recursive:true});
  mkdirSync(join(directory,'sessions'));
  run(['tests/database.php','create',db,directory]);created=true;
  run(['backend/migration/main.php'],directory);
  run(['backend/migration/main.php'],directory); // Existing data survives a second migration.
  server=spawn(php,['-d','display_errors=0','-d','upload_max_filesize=6M','-d','post_max_size=16M','-d','session.save_path='+join(directory,'sessions'),'-S','localhost:18081','-t','backend','backend/index.php'],{cwd:directory,env,stdio:['ignore','pipe','pipe']});
  server.stdout.on('data',chunk=>logs+=chunk);server.stderr.on('data',chunk=>logs+=chunk);
  server.on('error',error=>logs+=error.message);
  for(let attempt=0;attempt<50;attempt++) {
    try{const r=await request('/public', 'GET', undefined, false);if(r.res.ok) break;}catch{}
    if(attempt===49) throw new Error('Test server unavailable: '+logs);
    await new Promise(r=>setTimeout(r,100));
  }
  const original=(await request('/public')).json;
  assert.equal(original.data.profil.nama_lengkap,'Gilbert Aldrich Rumahorbo');
  assert.equal(original.data.karya_terbaik.length,10);
  assert.ok(!/"(?:password|token|username)":/.test(JSON.stringify(original)));
  status(await request('/users','GET',undefined,false),401);
  status(await request('/login','POST',{username:[],password:'x'},false),400);
  status(await request('/login','POST',{username:'test-admin',password:'wrong'},false),401);
  status(await request('/login','POST',{username:'test-admin',password:env.PORTFOLIO_ADMIN_PASSWORD},false,{Origin:'https://evil.example'}),403);
  await signIn();
  status(await request('/verify_login'),200);
  status(await request('/users'),200);
  status(await request('/keahlian','POST',{nama_keahlian:'Test',level:'Beginner'}),403);
  status(await request('/keahlian','POST',{token:csrf,nama_keahlian:[],level:'Beginner'}),400);
  status(await request('/kontak','POST',{token:csrf,nama_media:'Test',url:'javascript:alert(1)'}),400);
  status(await request('/pendidikan','POST',{token:csrf,nama_institusi:[],tingkat:'S1',jurusan:'x'}),400);
  status(await request('/karya','PUT',{token:csrf,id:999999,nama_karya:'x',deskripsi:'x'}),404);
  const cases=[
    ['/keahlian','keahlian',{nama_keahlian:'Integration skill',level:'Advanced',kategori:'Lainnya'},{nama_keahlian:'Updated skill',level:'Beginner'}],
    ['/kontak','kontak_aktif',{nama_media:'Integration contact',url:'mailto:test@example.com'},{nama_media:'Updated contact',url:'https://example.com'}],
    ['/pendidikan','riwayat_pendidikan',{nama_institusi:'Integration school',tingkat:'S1',jurusan:'Computer Science',tahun_mulai:2024,tahun_selesai:0},{jurusan:'Updated major'}],
    ['/pengalaman','pengalaman',{nama_perusahaan:'Integration org',jabatan:'Tester',tahun_mulai:2025,periode:'2025',deskripsi:'Description'},{jabatan:'Updated role'}],
    ['/karya','karya_terbaik',{nama_karya:'Integration project',deskripsi:'Description',url:'https://example.com',teknologi:'PHP',unggulan:0,studi_kasus:'Preserve this case'},{nama_karya:'Updated project'}],
    ['/pencapaian','pencapaian',{nama:'Integration achievement',penyelenggara:'Test org',jenis:'Kegiatan',tahun:2026,deskripsi:'Description'},{nama:'Updated achievement'}]
  ];
  for(const [path,key,data,update] of cases) {
    const add=await request(path,'POST',{...data,token:csrf});status(add,200);
    const id=add.json.id;assert.ok(id>0);
    status(await request(path,'PUT',{...update,id,token:csrf}),200);
    const get=await request(path);status(get,200);
    const row=get.json[key].find(x=>Number(x.id)===Number(id));
    assert.ok(row);for(const [field,value] of Object.entries(update)) assert.equal(row[field],value);
    if(path==='/karya') assert.equal(row.studi_kasus,data.studi_kasus);
    status(await request(path,'DELETE',{id,token:csrf}),200);
  }
  const cv=await fetch(base+'/uploads/cv-gilbert-2026.pdf');assert.equal(cv.status,200);assert.match(cv.headers.get('content-type'),/pdf/);checks++;
  status(await request('/uploads/../../config.local.php'),404);
  status(await request('/migration/main.php'),404);
  const profile=(await request('/users')).json.user;
  const form=new FormData();
  for(const key of ['username','email','nama_lengkap','nomor_hp','bio']) form.set(key,profile[key] || '');
  form.set('token',csrf);
  form.set('cv',new Blob([readFileSync(join(root,'backend/uploads/cv-gilbert-2026.pdf'))],{type:'application/pdf'}),'cv.pdf');
  const upload=await request('/users','POST',form);status(upload,200);assert.match(upload.json.user.cv,/^[a-f0-9]{32}\.pdf$/);
  const beforeFiles=readdirSync(join(directory,'backend/uploads')).sort();
  form.set('foto',new Blob([readFileSync(join(root,'backend/uploads/default.png'))],{type:'image/png'}),'photo.png');
  form.set('cv',new Blob(['not a pdf'],{type:'application/pdf'}),'bad.pdf');
  status(await request('/users','POST',form),400);
  assert.deepEqual(readdirSync(join(directory,'backend/uploads')).sort(),beforeFiles);
  form.delete('foto');form.set('cv',new Blob([new Uint8Array(5*1024*1024+1)],{type:'application/pdf'}),'large.pdf');
  status(await request('/users','POST',form),413);
  form.delete('cv');form.set('password','short');
  status(await request('/users','POST',form),400);
  const oldCookie=cookie;
  await signIn(); const otherCookie=cookie;
  cookie=oldCookie;
  form.set('password','A-New-Test-Password-2026');
  const changed=await request('/users','POST',form);status(changed,200);
  const renewedCookie=changed.res.headers.get('set-cookie').split(';')[0];
  cookie=renewedCookie;status(await request('/users'),200);
  // Password change invalidates other sessions while retaining the current one.
  cookie=otherCookie;status(await request('/users'),401);
  cookie=oldCookie;
  // The current session ID was rotated, so sign in again with the new password.
  await signIn('A-New-Test-Password-2026');
  status(await request('/logout','POST',{token:csrf}),200);
  status(await request('/users'),401);
  await signIn('A-New-Test-Password-2026');
  const sessionId=cookie.split('=')[1];
  const sessionFile=join(directory,'sessions','sess_'+sessionId);
  const saved=readFileSync(sessionFile,'utf8');
  writeFileSync(sessionFile,saved.replace(/last_seen\|i:\d+;/,'last_seen|i:1;'));
  status(await request('/users'),401);
  await signIn('A-New-Test-Password-2026');
  const absoluteFile=join(directory,'sessions','sess_'+cookie.split('=')[1]);
  writeFileSync(absoluteFile,readFileSync(absoluteFile,'utf8').replace(/created\|i:\d+;/,'created|i:1;'));
  status(await request('/users'),401);
  for(let index=0;index<12;index++) await request('/login','POST',{username:'test-admin',password:'wrong'},false);
  const limited=await request('/login','POST',{username:'test-admin',password:'wrong'},false);
  status(limited,429);assert.ok(Number(limited.res.headers.get('retry-after'))>0);
  console.log('PASS: '+checks+' API checks; isolated database, CRUD, cookie sessions, CSRF, expiry, password rotation, throttle, uploads and rollback.');
} catch(error) {
  console.error(logs.slice(-4000));throw error;
} finally {
  if(server && server.exitCode===null) {server.kill();await once(server,'exit');}
  if(created) run(['tests/database.php','drop',db,directory]);
  rmSync(directory,{recursive:true,force:true});
}
