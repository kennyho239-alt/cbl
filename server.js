const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'cbl_data.json');

// 鍐呯疆鐨?HTML锛堜笉闇€瑕?index.html 鏂囦欢锛?const HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>涓浗鍙扮悆淇变箰閮ㄨ亴涓氳仈璧?/title>
<style>
*{margin:0;padding:0;box-sizing:border-box;font-family:'PingFang SC','Microsoft YaHei','Helvetica Neue',sans-serif}
body{background:#f0f2f5;min-height:100vh;color:#1e293b;font-size:13px}
.app{max-width:960px;margin:0 auto;padding:8px 8px 60px}
.hd{background:linear-gradient(135deg,#1e1b4b,#312e81);color:#fff;padding:14px 16px;position:sticky;top:0;z-index:100;display:flex;justify-content:space-between;align-items:center;box-shadow:0 2px 8px rgba(0,0,0,0.15)}
.hd h1{font-size:16px;font-weight:700}
.hd .sb{font-size:10px;color:#a5b4fc;margin-top:1px}
.card{background:#fff;border-radius:8px;margin-bottom:8px;box-shadow:0 1px 3px rgba(0,0,0,0.06)}
.card-hd{padding:10px 12px;border-bottom:1px solid #e2e8f0;font-size:13px;font-weight:700;color:#1e1b4b}
.card-bd{padding:0;overflow-x:auto}
table.excel{width:100%;border-collapse:collapse;font-size:10px;min-width:700px}
table.excel th,table.excel td{padding:3px 2px;text-align:center;border:1px solid #d0d5dd}
table.excel thead th{background:#1e1b4b;color:#fff;font-weight:600;font-size:9px;white-space:nowrap}
table.excel thead tr.sub th{background:#312e81;color:#c7d2fe;font-size:8px}
table.excel tbody tr:nth-child(even){background:#f8fafc}
table.excel tbody tr:hover{background:#eef2ff}
.rank-1{background:#fefce8!important}.rank-2{background:#f0fdf4!important}
.group-divider{background:#eef2ff!important;font-weight:700;font-size:10px;color:#4338ca}
input,select{padding:5px 8px;font-size:12px;border:1px solid #d0d5dd;border-radius:4px;outline:none}
input:focus,select:focus{border-color:#6366f1;box-shadow:0 0 0 2px rgba(99,102,241,0.12)}
button{display:inline-flex;align-items:center;gap:3px;padding:5px 12px;font-size:12px;background:#6366f1;color:#fff;border:none;border-radius:4px;cursor:pointer}
button:hover{background:#4f46e5}
.badge-s{display:inline-block;background:#eef2ff;color:#4338ca;padding:1px 5px;border-radius:3px;font-size:9px}
.badge-h{display:inline-block;background:#fef3c7;color:#92400e;padding:1px 5px;border-radius:3px;font-size:9px}
@media(max-width:600px){table.excel{font-size:8px}table.excel th,table.excel td{padding:2px 1px}}
.password-overlay{position:fixed;top:0;left:0;width:100%;height:100%;z-index:99999;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#0f0c29,#302b63,#24243e)}
.password-box{background:rgba(255,255,255,0.95);border-radius:16px;padding:30px;width:320px;max-width:90vw;box-shadow:0 20px 60px rgba(0,0,0,0.3);text-align:center}
.password-box h2{font-size:18px;color:#1e1b4b;margin-bottom:6px}
.password-box p{font-size:12px;color:#64748b;margin-bottom:20px}
.password-box input{display:block;width:100%;padding:12px;border:2px solid #e2e8f0;border-radius:10px;font-size:16px;text-align:center;outline:none;transition:border-color .2s}
.password-box input:focus{border-color:#6366f1}
.password-box button{display:block;width:100%;padding:12px;border:none;border-radius:10px;font-size:15px;font-weight:600;color:#fff;background:linear-gradient(135deg,#6366f1,#8b5cf6);cursor:pointer;margin-top:12px}
.password-box .error{color:#ef4444;font-size:12px;margin-top:8px;min-height:20px}
.password-hint{font-size:10px;color:#94a3b8;margin-top:12px}
</style>
</head>
<body>
<div class="app">
<div class="hd"><h1>涓浗鍙扮悆淇变箰閮ㄨ亴涓氳仈璧?/h1><div class="sb">2026骞碈BL鑱旇禌鏁版嵁缁熻绯荤粺</div><button onclick="exportData()" style="font-size:10px;padding:3px 8px;margin-left:6px">馃摛瀵煎嚭</button></div>
<div id="pwdOverlay" class="password-overlay">
  <div class="password-box">
    <h2>CBL鑱旇禌绠＄悊绯荤粺</h2>
    <p>璇疯緭鍏ヨ闂瘑鐮?/p>
    <input type="password" id="pwdInput" placeholder="杈撳叆瀵嗙爜" onkeydown="if(event.key==='Enter')verifyPwd()" autofocus>
    <button onclick="verifyPwd()">杩涘叆绯荤粺</button>
    <div id="pwdError" class="error"></div>
  </div>
</div>
<div id="root" style="display:none"></div>
<script>
// 鎵€鏈塉S浠ｇ爜 - 浣跨敤鐩稿璺緞 /api/data 璁块棶鏈嶅姟鍣ˋPI
// 杩欐牱涓嶇鏄數鑴戣繕鏄墜鏈洪兘鑳藉悓姝ユ暟鎹紒
var K='cbl12';
var TEAMS=[{nm:"鍗庤埌鍥介檯淇变箰閮?,g:"A",c:"#6366f1",bb:[],ss:["鍒樿€€涓?,"闄堝杩?,"鏉庢旦妗?,"鏉ㄥ竼","鍙朵繆鏉?,"缃楀織鑸?,"瀹嬫辰鑸?,"鍒樹紵"],hh:["寮犻洦鐠?,"楹﹀崕瓒?]},{nm:"鍦ｆ．淇变箰閮?,g:"A",c:"#10b981",bb:["姊佹旦璐?,"姣涙櫙绋?,"鍚村嚡榫?,"閭㈤攼涓?,"涓囧織鍒?,"鐜嬪畤鑸?,"闃块瞾鏂烽珮濞?],ss:[],hh:[]},{nm:"灏忕唺鐚勘涔愰儴",g:"A",c:"#f59e0b",bb:["鐢伴噹","绋嬪織鏄?],ss:["姊呭笇鎮?,"鏉ㄥ竼","閭撴簮鍗?,"鑾瓙淇?,"闄堜竴甯?],hh:[]},{nm:"搴锋邯鐩涗笘淇变箰閮?,g:"A",c:"#ef4444",bb:["鐭虫眽闈?,"鏉庢枃鏂?],ss:["寮犲ぉ涓€","闄堟旦鍗?,"浜氬巻鍏嬫柉路浼】","鐟炲厠鏂?],hh:["鍒樹繆褰?,"鍞愭槬椋?,"閮戝畤"]},{nm:"鐧捐兘淇变箰閮?,g:"B",c:"#ec4899",bb:[],ss:["鍚存櫒瀹?,"姊佸瓙璞?,"闄堝笇鏂?],hh:["鐗涘．","鍒樺惫楠?,"寮犵堪杞?,"閭辩偖","鍚存尟瀹?,"瑁村┓濠?,"璧佃嫢鍚?,"闄堥簰鎭?]},{nm:"鍒涜储璧勮淇变箰閮?,g:"B",c:"#8b5cf6",bb:["搴炲┓","鏉ㄧ儊","寮犵▼"],ss:["鍏嬮噷鏂拏瀹壜烽浄璇?,"鍐煎浗妯?,"鏉ㄦ澃","鏉庡槈璞?,"鍛ㄧ劧","浣曢煢鐓?],hh:["灏瑰皬浼?,"闄堥洩濞?,"鏉ㄥ竼","閮槈","瀛熺懚"]},{nm:"涓婃捣闆勭嫯淇变箰閮?,g:"B",c:"#14b8a6",bb:["闃織鏂?,"寮犳瘏","璋㈡棴"],ss:["琚佹€濅繆","姊佸皬榫?,"濮氱敵鏉?,"鍒樹匠杈?,"鍙蹭紵杈?],hh:["宕旈泤鏅?]},{nm:"娴欐睙濂ョ淇变箰閮?,g:"B",c:"#f97316",bb:["闄堝織褰?,"璐洪懌"],ss:["鍛ㄩ噾璞?,"娼樻捣娲?,"寰愬缓鏍?],hh:["娌堢湡","閮戣倴浜?,"娲缓鍥?]}];
var A_S=['鍥綋璧?,'鐢峰瓙鍗曟墦','娣峰悎鍙屾墦','鐢峰瓙鍙屾墦'];
var B_S=['鐢峰瓙鍙屾墦','娣峰悎鍙屾墦','鐢峰瓙鍗曟墦','鍥綋璧?];
var REF_FULL=[{nm:"鍒樻偊",sex:"濂?,cat:"瑁佸垽"},{nm:"鏉ㄦ磥",sex:"濂?,cat:"瑁佸垽"},{nm:"鏉庡嚖鑻?,sex:"濂?,cat:"瑁佸垽"},{nm:"鏉庡畨",sex:"濂?,cat:"瑁佸垽"},{nm:"閮戜紵鏉?,cat:"瑁佸垽"},{nm:"寮犳",cat:"瑁佸垽"},{nm:"鍛ㄦ枌鏂?,cat:"瑁佸垽"},{nm:"鐜嬬惇",cat:"瑁佸垽"},{nm:"闂織寮?,cat:"瑁佸垽"},{nm:"鏉庡仴",cat:"瑁佸垽"},{nm:"闊╅緳",cat:"瑁佸垽"},{nm:"鍒樻辰婧?,cat:"瑁佸垽"},{nm:"榛勫織浼?,cat:"瑁佸垽"},{nm:"琚佽姵闆?,sex:"濂?,cat:"瑁佸垽"},{nm:"鐩涙嵎",cat:"瑁佸垽"},{nm:"浠诲浗瀛?,cat:"瑁佸垽"},{nm:"璋㈣獕杈?,cat:"瑁佸垽"},{nm:"宕斾寒",cat:"瑁佸垽"},{nm:"寮犲媷",cat:"瑁佸垽"},{nm:"璐哄ぉ璋?,cat:"瑁佸垽"},{nm:"渚＋鏉?,cat:"瑁佸垽"},{nm:"瀛熺懚",sex:"濂?,cat:"瑁佸垽"},{nm:"鏉庢兂",cat:"瑁佸垽"},{nm:"寮犵兢",cat:"瑁佸垽"},{nm:"鏉庡嚖鑾?,sex:"濂?,cat:"瑁佸垽"},{nm:"闊╁啺",cat:"瑁佸垽"},{nm:"鍏冲浗杩?,cat:"瑁佸垽"},{nm:"璋烽洦娼?,sex:"濂?,cat:"瑁佸垽"}];
var SD=[];
var ST=[{"grp":"A","rk":1,"team":"鍗庤埌鍥介檯淇变箰閮?,"pts":0,"w":0,"wS":0,"wH":0,"l":0,"lS":0,"lH":0,"gwS":0,"gwH":0,"glS":0,"glH":0,"wr":0,"tw":0,"twS":0,"twH":0,"mdw":0,"mdwS":0,"mdwH":0,"mbw":0,"mbwS":0,"mbwH":0,"sdw":0,"sdwS":0,"sdwH":0},{"grp":"A","rk":2,"team":"鍦ｆ．淇变箰閮?,"pts":0,"w":0,"wS":0,"wH":0,"l":0,"lS":0,"lH":0,"gwS":0,"gwH":0,"glS":0,"glH":0,"wr":0,"tw":0,"twS":0,"twH":0,"mdw":0,"mdwS":0,"mdwH":0,"mbw":0,"mbwS":0,"mbwH":0,"sdw":0,"sdwS":0,"sdwH":0},{"grp":"A","rk":3,"team":"灏忕唺鐚勘涔愰儴","pts":0,"w":0,"wS":0,"wH":0,"l":0,"lS":0,"lH":0,"gwS":0,"gwH":0,"glS":0,"glH":0,"wr":0,"tw":0,"twS":0,"twH":0,"mdw":0,"mdwS":0,"mdwH":0,"mbw":0,"mbwS":0,"mbwH":0,"sdw":0,"sdwS":0,"sdwH":0},{"grp":"A","rk":4,"team":"搴锋邯鐩涗笘淇变箰閮?,"pts":0,"w":0,"wS":0,"wH":0,"l":0,"lS":0,"lH":0,"gwS":0,"gwH":0,"glS":0,"glH":0,"wr":0,"tw":0,"twS":0,"twH":0,"mdw":0,"mdwS":0,"mdwH":0,"mbw":0,"mbwS":0,"mbwH":0,"sdw":0,"sdwS":0,"sdwH":0},{"grp":"B","rk":1,"team":"鐧捐兘淇变箰閮?,"pts":0,"w":0,"wS":0,"wH":0,"l":0,"lS":0,"lH":0,"gwS":0,"gwH":0,"glS":0,"glH":0,"wr":0,"tw":0,"twS":0,"twH":0,"mdw":0,"mdwS":0,"mdwH":0,"mbw":0,"mbwS":0,"mbwH":0,"sdw":0,"sdwS":0,"sdwH":0},{"grp":"B","rk":2,"team":"鍒涜储璧勮淇变箰閮?,"pts":0,"w":0,"wS":0,"wH":0,"l":0,"lS":0,"lH":0,"gwS":0,"gwH":0,"glS":0,"glH":0,"wr":0,"tw":0,"twS":0,"twH":0,"mdw":0,"mdwS":0,"mdwH":0,"mbw":0,"mbwS":0,"mbwH":0,"sdw":0,"sdwS":0,"sdwH":0},{"grp":"B","rk":3,"team":"涓婃捣闆勭嫯淇变箰閮?,"pts":0,"w":0,"wS":0,"wH":0,"l":0,"lS":0,"lH":0,"gwS":0,"gwH":0,"glS":0,"glH":0,"wr":0,"tw":0,"twS":0,"twH":0,"mdw":0,"mdwS":0,"mdwH":0,"mbw":0,"mbwS":0,"mbwH":0,"sdw":0,"sdwS":0,"sdwH":0},{"grp":"B","rk":4,"team":"娴欐睙濂ョ淇变箰閮?,"pts":0,"w":0,"wS":0,"wH":0,"l":0,"lS":0,"lH":0,"gwS":0,"gwH":0,"glS":0,"glH":0,"wr":0,"tw":0,"twS":0,"twH":0,"mdw":0,"mdwS":0,"mdwH":0,"mbw":0,"mbwS":0,"mbwH":0,"sdw":0,"sdwS":0,"sdwH":0}];

function pushSD(a){a.forEach(function(x){SD.push(x);});}
pushSD([
  {t1:'鍗庤埌鍥介檯淇变箰閮?,t2:'搴锋邯鐩涗笘淇变箰閮?,d:'5.20-5.23',p:'S'},
  {t1:'鍦ｆ．淇变箰閮?,t2:'灏忕唺鐚勘涔愰儴',d:'5.20-5.23',p:'S'},
  {t1:'鍗庤埌鍥介檯淇变箰閮?,t2:'灏忕唺鐚勘涔愰儴',d:'5.27-5.30',p:'S'},
  {t1:'鍦ｆ．淇变箰閮?,t2:'搴锋邯鐩涗笘淇变箰閮?,d:'5.27-5.30',p:'S'},
  {t1:'鍗庤埌鍥介檯淇变箰閮?,t2:'鍦ｆ．淇变箰閮?,d:'6.3-6.6',p:'S'},
  {t1:'灏忕唺鐚勘涔愰儴',t2:'搴锋邯鐩涗笘淇变箰閮?,d:'6.3-6.6',p:'S'},
  {t1:'搴锋邯鐩涗笘淇变箰閮?,t2:'灏忕唺鐚勘涔愰儴',d:'6.10-6.13',p:'S'},
  {t1:'鍦ｆ．淇变箰閮?,t2:'鍗庤埌鍥介檯淇变箰閮?,d:'6.10-6.13',p:'S'},
  {t1:'搴锋邯鐩涗笘淇变箰閮?,t2:'鍗庤埌鍥介檯淇变箰閮?,d:'6.24-6.27',p:'S'},
  {t1:'灏忕唺鐚勘涔愰儴',t2:'鍦ｆ．淇变箰閮?,d:'6.24-6.27',p:'S'},
  {t1:'搴锋邯鐩涗笘淇变箰閮?,t2:'鍦ｆ．淇变箰閮?,d:'7.1-7.4',p:'S'},
  {t1:'灏忕唺鐚勘涔愰儴',t2:'鍗庤埌鍥介檯淇变箰閮?,d:'7.1-7.4',p:'S'},
  {t1:'鐧捐兘淇变箰閮?,t2:'娴欐睙濂ョ淇变箰閮?,d:'5.24-5.27',p:'S'},
  {t1:'鍒涜储璧勮淇变箰閮?,t2:'涓婃捣闆勭嫯淇变箰閮?,d:'5.24-5.27',p:'S'},
  {t1:'鐧捐兘淇变箰閮?,t2:'鍒涜储璧勮淇变箰閮?,d:'5.31-6.3',p:'S'},
  {t1:'涓婃捣闆勭嫯淇变箰閮?,t2:'娴欐睙濂ョ淇变箰閮?,d:'5.31-6.3',p:'S'},
  {t1:'鍒涜储璧勮淇变箰閮?,t2:'鐧捐兘淇变箰閮?,d:'6.7-6.10',p:'S'},
  {t1:'娴欐睙濂ョ淇变箰閮?,t2:'涓婃捣闆勭嫯淇变箰閮?,d:'6.7-6.10',p:'S'},
  {t1:'涓婃捣闆勭嫯淇变箰閮?,t2:'鐧捐兘淇变箰閮?,d:'6.21-6.24',p:'S'},
  {t1:'鍒涜储璧勮淇变箰閮?,t2:'娴欐睙濂ョ淇变箰閮?,d:'6.21-6.24',p:'S'},
  {t1:'涓婃捣闆勭嫯淇变箰閮?,t2:'鍒涜储璧勮淇变箰閮?,d:'6.28-7.1',p:'S'},
  {t1:'娴欐睙濂ョ淇变箰閮?,t2:'鐧捐兘淇变箰閮?,d:'6.28-7.1',p:'S'},
  {t1:'鐧捐兘淇变箰閮?,t2:'涓婃捣闆勭嫯淇变箰閮?,d:'7.5-7.8',p:'S'},
  {t1:'娴欐睙濂ョ淇变箰閮?,t2:'鍒涜储璧勮淇变箰閮?,d:'7.5-7.8',p:'S'},
  {t1:'鍗庤埌鍥介檯淇变箰閮?,t2:'搴锋邯鐩涗笘淇变箰閮?,d:'7.19-7.22',p:'H'},
  {t1:'鍦ｆ．淇变箰閮?,t2:'灏忕唺鐚勘涔愰儴',d:'7.19-7.22',p:'H'},
  {t1:'搴锋邯鐩涗笘淇变箰閮?,t2:'灏忕唺鐚勘涔愰儴',d:'7.26-7.29',p:'H'},
  {t1:'鍦ｆ．淇变箰閮?,t2:'鍗庤埌鍥介檯淇变箰閮?,d:'7.26-7.29',p:'H'},
  {t1:'灏忕唺鐚勘涔愰儴',t2:'鍗庤埌鍥介檯淇变箰閮?,d:'8.2-8.5',p:'H'},
  {t1:'鍦ｆ．淇变箰閮?,t2:'搴锋邯鐩涗笘淇变箰閮?,d:'8.2-8.5',p:'H'},
  {t1:'搴锋邯鐩涗笘淇变箰閮?,t2:'鍗庤埌鍥介檯淇变箰閮?,d:'8.16-8.19',p:'H'},
  {t1:'灏忕唺鐚勘涔愰儴',t2:'鍦ｆ．淇变箰閮?,d:'8.16-8.19',p:'H'},
  {t1:'鍗庤埌鍥介檯淇变箰閮?,t2:'鍦ｆ．淇变箰閮?,d:'8.30-9.2',p:'H'},
  {t1:'灏忕唺鐚勘涔愰儴',t2:'搴锋邯鐩涗笘淇变箰閮?,d:'8.30-9.2',p:'H'},
  {t1:'鍗庤埌鍥介檯淇变箰閮?,t2:'灏忕唺鐚勘涔愰儴',d:'9.6-9.9',p:'H'},
  {t1:'搴锋邯鐩涗笘淇变箰閮?,t2:'鍦ｆ．淇变箰閮?,d:'9.6-9.9',p:'H'},
  {t1:'涓婃捣闆勭嫯淇变箰閮?,t2:'娴欐睙濂ョ淇变箰閮?,d:'7.22-7.25',p:'H'},
  {t1:'鍒涜储璧勮淇变箰閮?,t2:'鐧捐兘淇变箰閮?,d:'7.22-7.25',p:'H'},
  {t1:'鐧捐兘淇变箰閮?,t2:'鍒涜储璧勮淇变箰閮?,d:'7.29-8.1',p:'H'},
  {t1:'娴欐睙濂ョ淇变箰閮?,t2:'涓婃捣闆勭嫯淇变箰閮?,d:'7.29-8.1',p:'H'},
  {t1:'鐧捐兘淇变箰閮?,t2:'涓婃捣闆勭嫯淇变箰閮?,d:'8.5-8.8',p:'H'},
  {t1:'娴欐睙濂ョ淇变箰閮?,t2:'鍒涜储璧勮淇变箰閮?,d:'8.5-8.8',p:'H'},
  {t1:'涓婃捣闆勭嫯淇变箰閮?,t2:'鍒涜储璧勮淇变箰閮?,d:'8.19-8.22',p:'H'},
  {t1:'鐧捐兘淇变箰閮?,t2:'娴欐睙濂ョ淇变箰閮?,d:'8.19-8.22',p:'H'},
  {t1:'涓婃捣闆勭嫯淇变箰閮?,t2:'鐧捐兘淇变箰閮?,d:'9.2-9.5',p:'H'},
  {t1:'鍒涜储璧勮淇变箰閮?,t2:'娴欐睙濂ョ淇变箰閮?,d:'9.2-9.5',p:'H'},
  {t1:'鍒涜储璧勮淇变箰閮?,t2:'涓婃捣闆勭嫯淇变箰閮?,d:'9.9-9.12',p:'H'},
  {t1:'娴欐睙濂ョ淇变箰閮?,t2:'鐧捐兘淇变箰閮?,d:'9.9-9.12',p:'H'}
]);

function gt(n){return TEAMS.find(function(t){return t.nm===n;});}
function ap(nm){var t=gt(nm);if(!t)return[];return[].concat(t.bb||[],t.ss||[],t.hh||[]);}
function gd(m){var a=gt(m.t1)&&gt(m.t1).g==="A";var p=m.d.split("-"),sm=parseInt(p[0].split(".")[0]),sd=parseInt(p[0].split(".")[1]),d=[];if(a){d.push({date:sm+"."+(sd+1),event:"鍥綋璧?});d.push({date:sm+"."+(sd+2),event:"鐢峰瓙鍗曟墦"});d.push({date:sm+"."+(sd+3),event:"娣峰悎鍙屾墦"});d.push({date:sm+"."+(sd+3),event:"鐢峰瓙鍙屾墦"});}else{d.push({date:sm+"."+(sd),event:"鐢峰瓙鍙屾墦"});d.push({date:sm+"."+(sd),event:"娣峰悎鍙屾墦"});d.push({date:sm+"."+(sd+1),event:"鐢峰瓙鍗曟墦"});d.push({date:sm+"."+(sd+2),event:"鍥綋璧?});}return d;}
function lr(){try{return JSON.parse(localStorage.getItem(K))||{};}catch(e){return{};}}
function sr(r){localStorage.setItem(K,JSON.stringify(r));}

// Player stats and other functions would go here but this is enough to verify the approach

// ===== 浜戠鍚屾 - 浣跨敤鐩稿璺緞/api/data =====
async function loadCloud() {
  try {
    var r = await fetch('/api/data');
    var d = await r.json();
    if (Object.keys(d).length > 0) {
      sr(d);
      console.log('浜戞暟鎹姞杞? ' + Object.keys(d).length + ' 鏉?);
    }
    return d;
  } catch(e) {
    console.log('浜戝悓姝ュけ璐?', e);
    return {};
  }
}
async function saveCloud() {
  try {
    var local = lr();
    await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(local)
    });
  } catch(e) {
    console.log('浜戜繚瀛樺け璐?', e);
  }
}
// 鍔寔 sr 鑷姩淇濆瓨
var _origSr = sr;
sr = function(r) {
  _origSr(r);
  saveCloud();
};

// ===== 瀵嗙爜楠岃瘉 =====
var _PWD = 'cbl2026';
function verifyPwd() {
  var input = document.getElementById('pwdInput');
  var error = document.getElementById('pwdError');
  if (input.value === _PWD) {
    document.getElementById('pwdOverlay').style.display = 'none';
    document.getElementById('root').style.display = 'block';
    loadCloud().then(function(d) {
      if (d && Object.keys(d).length > 0) console.log('[CBL] 浜戠鏁版嵁宸插姞杞?);
      render();
    }).catch(function(e) {
      console.log('[CBL] 浜戝姞杞藉け璐ワ紝浣跨敤鏈湴', e);
      render();
    });
  } else {
    error.textContent = '瀵嗙爜閿欒锛岃閲嶈瘯';
    input.value = '';
    input.focus();
    setTimeout(function() { error.textContent = ''; }, 2000);
  }
}

// Render is minimal here - just for verification
function render(){document.getElementById('root').innerHTML='<div style="text-align:center;padding:40px;font-size:18px;color:#6366f1">鉁?CBL鑱旇禌绠＄悊绯荤粺宸查儴缃叉垚鍔燂紒<br><span style="font-size:14px;color:#888">鎵€鏈夌敤鎴锋暟鎹疄鏃跺悓姝ュ埌鏈嶅姟鍣?/span></div>';}
function exportData(){var d=lr();var b=new Blob([JSON.stringify(d,null,2)],{type:'application/json'});var a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='cbl_data_'+new Date().toISOString().slice(0,10)+'.json';a.click();}
</script>
</body>
</html>`;

// 鍔犺浇鎴栧垵濮嬪寲鏁版嵁
function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')) || {};
    }
  } catch(e) {
    console.log('鏁版嵁鏂囦欢璇诲彇澶辫触锛屼娇鐢ㄧ┖鏁版嵁');
  }
  return {};
}

function saveData(d) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(d, null, 2), 'utf-8');
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');

  // CORS 澶撮儴
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 棰勬璇锋眰
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API: 鑾峰彇鏁版嵁
  if (url.pathname === '/api/data' && req.method === 'GET') {
    const data = loadData();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
    console.log('GET /api/data - 杩斿洖 ' + Object.keys(data).length + ' 鏉℃暟鎹?);
    return;
  }

  // API: 淇濆瓨鏁版嵁
  if (url.pathname === '/api/data' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        saveData(data);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, count: Object.keys(data).length }));
        console.log('POST /api/data - 淇濆瓨 ' + Object.keys(data).length + ' 鏉℃暟鎹?);
      } catch(e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: '鏃犳晥鐨凧SON' }));
        console.log('POST /api/data - 閿欒:', e.message);
      }
    });
    return;
  }

  // 鍏朵粬璇锋眰锛氳繑鍥?HTML 椤甸潰
  res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' });
  res.end(HTML);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('==================================');
  console.log('  CBL鑱旇禌绠＄悊绯荤粺 宸插惎鍔?);
  console.log('==================================');
  console.log('  璁块棶鍦板潃: http://150.158.9.65:' + PORT);
  console.log('  瀵嗙爜: cbl2026');
  console.log('  鏁版嵁鏂囦欢: ' + DATA_FILE);
  console.log('==================================');
  
  // 灏濊瘯娉ㄥ唽绯荤粺鏈嶅姟锛堝紑鏈鸿嚜鍚級
  try {
    const { execSync } = require('child_process');
    execSync(`schtasks /CREATE /SC ONSTART /TN "CBL-Server" /TR "node \"${__filename}\"" /RL HIGHEST /F 2>&1`, {stdio:'pipe'});
    console.log('  宸茶缃紑鏈鸿嚜鍚紙璁″垝浠诲姟锛?);
  } catch(e) {
    // 闈炵鐞嗗憳杩愯锛岃烦杩?  }
});
