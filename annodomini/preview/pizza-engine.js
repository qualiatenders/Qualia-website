// Anno Domini — heightmap pizza renderer (preview)
// Each layer paints albedo (A), height (H) and gloss (S); one lighting pass
// turns that into a shaded, shadow-casting, top-lit image.

function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
let R=mulberry(47);
const rnd=(a,b)=>a+(b-a)*R();
const clamp=(v,a=0,b=1)=>v<a?a:v>b?b:v;
const sstep=(a,b,v)=>{const t=clamp((v-a)/(b-a));return t*t*(3-2*t)};
const mix=(a,b,t)=>a+(b-a)*t;

function makeNoise(seed){
  const p=new Uint16Array(512),r=mulberry(seed),g=new Float32Array(256);
  for(let i=0;i<256;i++){p[i]=i;g[i]=r()}
  for(let i=255;i>0;i--){const j=(r()*(i+1))|0,t=p[i];p[i]=p[j];p[j]=t}
  for(let i=0;i<256;i++)p[i+256]=p[i];
  return(x,y)=>{const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,X=xi&255,Y=yi&255;
    const a=g[p[p[X]+Y]],b=g[p[p[X+1]+Y]],c=g[p[p[X]+Y+1]],d=g[p[p[X+1]+Y+1]];
    const u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v}}
function fbm(n,x,y,o){let s=0,a=.5,f=1,t=0;for(let i=0;i<o;i++){s+=a*n(x*f,y*f);t+=a;f*=2.03;a*=.5}return s/t}
const N=[...Array(8)].map((_,i)=>makeNoise(101+i*17));

// smooth organic outline (low-frequency only)
function blob(ctx,x,y,r,irr,seed,stretch=1,rot=0){
  const n=makeNoise(seed);ctx.beginPath();
  for(let i=0;i<=96;i++){const a=i/96*Math.PI*2;
    const k=1+irr*((fbm(n,Math.cos(a)*1.3+4,Math.sin(a)*1.3+4,3)-.5)*2);
    const lx=Math.cos(a)*r*k*stretch,ly=Math.sin(a)*r*k;
    const px=x+lx*Math.cos(rot)-ly*Math.sin(rot),py=y+lx*Math.sin(rot)+ly*Math.cos(rot);
    i?ctx.lineTo(px,py):ctx.moveTo(px,py)}
  ctx.closePath()}

// ---------- scene ----------
function renderScene(canvas,{base=true,toppings=()=>{},PRf=.43,light=[-.52,-.62,.72]}={}){
  const W=canvas.width,cx=W/2,cy=W/2,PR=W*PRf,HS=PR*.11;
  const mk=()=>{const c=document.createElement('canvas');c.width=c.height=W;return c};
  const Ac=mk(),Hc=mk(),Sc=mk(),A=Ac.getContext('2d',{willReadFrequently:true}),H=Hc.getContext('2d',{willReadFrequently:true}),S=Sc.getContext('2d',{willReadFrequently:true});
  H.fillStyle='#000';H.fillRect(0,0,W,W);S.fillStyle='#000';S.fillRect(0,0,W,W);
  const Hb=new Float32Array(W*W),alpha=new Float32Array(W*W).fill(1);

  // --- base pass: stone, dough, sauce ---
  const img=A.createImageData(W,W),d=img.data,sc=1440/W;
  const SR=base?1.075:1.6;
  for(let y=0;y<W;y++)for(let x=0;x<W;x++){
    const i=y*W+x,o=i*4,dx=(x-cx)/PR,dy=(y-cy)/PR,r=Math.hypot(dx,dy),ca=dx/(r||1),sa=dy/(r||1);
    const X=x*sc,Y=y*sc;
    // stone peel
    const sn=fbm(N[6],X*.012,Y*.012,4),sf=N[7](X*.4,Y*.4);
    let cr=30+sn*14+sf*5,cg=29+sn*13+sf*5,cb=27+sn*12+sf*5;
    if(N[5](X*.7,Y*.7)>.93&&base){const f=N[4](X*.05,Y*.05);if(f>.45){cr=cg=cb=mix(cr,214,.35)}}
    let h=0,spec=.06;
    alpha[i]=base?sstep(SR+.006,SR-.004,r):1;
    if(base){
      const en=fbm(N[0],ca*1.4+5,sa*1.4+5,3)-.5,rr=r/(1+.075*en);
      const rs=.775+.06*(fbm(N[1],ca*2.2+9,sa*2.2+9,3)-.5)+.012*(N[2](X*.03,Y*.03)-.5);
      if(rr<1.015){
        const bub=fbm(N[2],X*.011,Y*.011,4),bub2=fbm(N[3],X*.032,Y*.032,2);
        const u=clamp((rr-rs+.07)/(1-rs+.07)),prof=Math.pow(Math.sin(Math.PI*Math.pow(u,.78)),.55)*sstep(1.012,.985,rr);
        const lift=.13*sstep(1.01,.96,rr);
        h=lift+prof*(.72+.6*(bub-.5));
        // dough colour: pale → golden → baked
        const bake=clamp(prof*.9+(bub-.5)*1.3+(1-rr)*-.2+.1);
        let dr=mix(244,226,bake),dg=mix(214,160,bake),db=mix(160,82,bake);
        if(bake>.72){const t=(bake-.72)/.28;dr=mix(dr,176,t);dg=mix(dg,98,t);db=mix(db,42,t)}
        // leopard spotting on the raised rim
        const ch=fbm(N[4],X*.03,Y*.03,4),ch2=N[5](X*.11,Y*.11);
        const leo=sstep(.7,.76,ch)*sstep(.3,.7,prof)*.9+sstep(.84,.88,ch2)*sstep(.35,.75,prof)*.8;
        const leoE=sstep(.6,.7,ch)*sstep(.2,.6,prof)*.55;
        dr=mix(dr,150,leoE);dg=mix(dg,82,leoE);db=mix(db,32,leoE);
        dr=mix(dr,34,leo);dg=mix(dg,22,leo);db=mix(db,16,leo);
        // flour
        if(N[6](X*.9,Y*.9)>.8&&prof>.2){dr=mix(dr,246,.3);dg=mix(dg,238,.3);db=mix(db,222,.3)}
        const da=sstep(1.012,.995,rr);
        cr=mix(cr,dr,da);cg=mix(cg,dg,da);cb=mix(cb,db,da);
        spec=mix(spec,.08,da);
        // San Marzano sauce
        const m=sstep(rs+.012,rs-.01,rr);
        if(m>0){
          const v=fbm(N[1],X*.009,Y*.009,5),p=fbm(N[3],X*.08,Y*.08,3),th=sstep(rs,rs-.05,rr);
          let sr=mix(112,188,v),sg=mix(14,40,v),sb=mix(8,24,v);
          sr+=(p-.5)*30;sg+=(p-.5)*8;
          // thin, caramelised sauce near the rim
          sr=mix(mix(cr,140,.7),sr,th);sg=mix(mix(cg,48,.7),sg,th);sb=mix(mix(cb,22,.7),sb,th);
          cr=mix(cr,sr,m);cg=mix(cg,sg,m);cb=mix(cb,sb,m);
          h+=m*(.03+.018*(p-.5)+.03*(v-.5));spec=mix(spec,.42,m*th);
        }
      }
    }
    Hb[i]=h*HS;d[o]=cr;d[o+1]=cg;d[o+2]=cb;d[o+3]=255;S.globalAlpha=1;
    sB[i]=spec;
  }
  A.putImageData(img,0,0);

  // --- toppings paint into A/H/S ---
  toppings({A,H,S,cx,cy,PR,W});

  // --- lighting pass ---
  const ad=A.getImageData(0,0,W,W).data,hd=H.getImageData(0,0,W,W).data,gd=S.getImageData(0,0,W,W).data;
  const TS=PR*.045,Ht=new Float32Array(W*W);
  for(let i=0;i<W*W;i++)Ht[i]=Hb[i]+hd[i*4]/255*TS;
  // ambient occlusion from blurred height
  const blur=boxBlur(Ht,W,Math.max(2,W/90|0));
  const [lx0,ly0,lz0]=light,ll=Math.hypot(lx0,ly0,lz0),lx=lx0/ll,ly=ly0/ll,lz=lz0/ll,lxy=Math.hypot(lx,ly),sx=lx/lxy,sy=ly/lxy,slope=lz/lxy;
  const hx0=lx,hy0=ly,hz0=lz+1,hl=Math.hypot(hx0,hy0,hz0),hx=hx0/hl,hy=hy0/hl,hz=hz0/hl;
  const out=canvas.getContext('2d'),oi=out.createImageData(W,W),od=oi.data,steps=18,stepL=PR*.009;
  for(let y=1;y<W-1;y++)for(let x=1;x<W-1;x++){
    const i=y*W+x,o=i*4,h=Ht[i];
    const gx=(Ht[i+1]-Ht[i-1])*.5,gy=(Ht[i+W]-Ht[i-W])*.5;
    let nx=-gx,ny=-gy,nz=1;const nl=Math.hypot(nx,ny,nz);nx/=nl;ny/=nl;nz/=nl;
    const diff=Math.max(0,nx*lx+ny*ly+nz*lz);
    let occ=0;
    for(let k=1;k<=steps;k++){const dd=k*stepL,px=(x+sx*dd)|0,py=(y+sy*dd)|0;if(px<0||py<0||px>=W||py>=W)break;
      const s=Ht[py*W+px]-(h+dd*slope);if(s>0){occ=Math.max(occ,clamp(s/(PR*.012)))}}
    const sh=1-.62*occ,ao=clamp(1-(blur[i]-h)/(PR*.05)*.55,.45,1.06);
    const gl=sB[i]+gd[o]/255,sp=Math.pow(Math.max(0,nx*hx+ny*hy+nz*hz),48)*gl*sh*230+Math.pow(Math.max(0,nx*hx+ny*hy+nz*hz),8)*gl*sh*18;
    const lit=(.42+.82*diff*sh)*ao;
    od[o]=ad[o]*lit*1.02+sp;od[o+1]=ad[o+1]*lit+sp*.96;od[o+2]=ad[o+2]*lit*.96+sp*.88;od[o+3]=255*alpha[i];
  }
  out.putImageData(oi,0,0);
  // warm key light + film grain
  out.save();out.globalCompositeOperation='soft-light';
  const lg=out.createRadialGradient(cx-PR*.5,cy-PR*.55,0,cx,cy,PR*1.3);lg.addColorStop(0,'rgba(255,236,200,.5)');lg.addColorStop(1,'rgba(30,15,5,.45)');
  out.fillStyle=lg;out.globalCompositeOperation='source-atop';out.globalAlpha=.22;out.fillRect(0,0,W,W);out.restore();
  function boxBlur(src,w,r){const a=new Float32Array(w*w),b=new Float32Array(w*w);
    for(let y=0;y<w;y++){let s=0;for(let x=-r;x<=r;x++)s+=src[y*w+clamp(x,0,w-1)];for(let x=0;x<w;x++){a[y*w+x]=s/(2*r+1);s+=src[y*w+Math.min(w-1,x+r+1)]-src[y*w+Math.max(0,x-r)]}}
    for(let x=0;x<w;x++){let s=0;for(let y=-r;y<=r;y++)s+=a[clamp(y,0,w-1)*w+x];for(let y=0;y<w;y++){b[y*w+x]=s/(2*r+1);s+=a[Math.min(w-1,y+r+1)*w+x]-a[Math.max(0,y-r)*w+x]}}
    return b}
}
let sB;
const _render=renderScene;
renderScene=(c,o)=>{sB=new Float32Array(c.width*c.width);return _render(c,o)};

// ---------- ingredients (paint A = colour, H = height, S = gloss) ----------
function mozzarella({A,H,S},x,y,s,seed,rot=0){
  const st=1+R()*.35;
  // fat & whey bleeding into the sauce
  A.save();A.filter=`blur(${s*.22}px)`;blob(A,x,y,s*1.18,.32,seed,st,rot);A.fillStyle='rgba(222,120,64,.45)';A.fill();A.restore();
  A.save();A.filter=`blur(${s*.05}px)`;blob(A,x,y,s,.3,seed,st,rot);
  const g=A.createRadialGradient(x-s*.2,y-s*.2,s*.1,x,y,s*1.2);g.addColorStop(0,'#FAF5E6');g.addColorStop(.55,'#F0E4C8');g.addColorStop(.85,'#E6CC9C');g.addColorStop(1,'#D9A874');A.fillStyle=g;A.fill();
  A.clip();A.filter=`blur(${s*.09}px)`;
  for(let i=0;i<7;i++){A.fillStyle=`rgba(${rnd(180,205)|0},${rnd(118,140)|0},${rnd(55,75)|0},${rnd(.25,.55)})`;A.beginPath();A.ellipse(x+rnd(-.75,.75)*s,y+rnd(-.75,.75)*s,s*rnd(.07,.2),s*rnd(.05,.14),rnd(0,3),0,7);A.fill()}
  A.restore();
  H.save();H.filter=`blur(${s*.28}px)`;blob(H,x,y,s*.92,.3,seed,st,rot);const hg=H.createRadialGradient(x,y,0,x,y,s);hg.addColorStop(0,'#fff');hg.addColorStop(1,'#666');H.fillStyle=hg;H.globalCompositeOperation='lighten';H.fill();H.restore();
  S.save();S.filter=`blur(${s*.1}px)`;blob(S,x,y,s,.3,seed,st,rot);S.fillStyle='rgba(120,120,120,1)';S.globalCompositeOperation='lighten';S.fill();S.restore();
}
function salame({A,H,S},x,y,s,seed){
  // orange chilli oil weeping out
  A.save();A.filter=`blur(${s*.18}px)`;A.beginPath();A.arc(x+s*.05,y+s*.05,s*1.12,0,7);A.fillStyle='rgba(214,80,24,.38)';A.fill();A.restore();
  A.save();blob(A,x,y,s,.035,seed);A.fillStyle='#3E0D08';A.fill();blob(A,x,y,s*.9,.035,seed);A.clip();
  const g=A.createRadialGradient(x,y,s*.1,x,y,s);g.addColorStop(0,'#A9301F');g.addColorStop(.75,'#8C2115');g.addColorStop(1,'#561009');A.fillStyle=g;A.fillRect(x-s,y-s,s*2,s*2);
  const r2=mulberry(seed);
  for(let i=0;i<55;i++){const a=r2()*7,dd=Math.sqrt(r2())*s*.85;A.fillStyle=`rgba(${222+r2()*20|0},${160+r2()*30|0},${140+r2()*30|0},${.35+r2()*.35})`;A.beginPath();A.ellipse(x+Math.cos(a)*dd,y+Math.sin(a)*dd,s*(.025+r2()*.045),s*(.018+r2()*.03),r2()*3,0,7);A.fill()}
  for(let i=0;i<40;i++){const a=r2()*7,dd=Math.sqrt(r2())*s*.85;A.fillStyle='rgba(50,8,4,.55)';A.beginPath();A.arc(x+Math.cos(a)*dd,y+Math.sin(a)*dd,s*.018,0,7);A.fill()}
  const og=A.createRadialGradient(x,y,0,x,y,s*.6);og.addColorStop(0,'rgba(235,105,40,.4)');og.addColorStop(1,'rgba(235,105,40,0)');A.fillStyle=og;A.fillRect(x-s,y-s,s*2,s*2);
  A.restore();
  A.save();A.filter=`blur(${s*.04}px)`;A.lineWidth=s*.14;A.strokeStyle='rgba(28,6,3,.8)';blob(A,x,y,s*.93,.035,seed);A.stroke();A.restore();
  // cupped: raised crisp rim, oil pooled in the centre
  H.save();H.globalCompositeOperation='lighten';H.filter=`blur(${s*.12}px)`;blob(H,x,y,s*.95,.035,seed);H.fillStyle='#5a5a5a';H.fill();
  H.lineWidth=s*.2;H.strokeStyle='#d8d8d8';blob(H,x,y,s*.86,.035,seed);H.stroke();H.restore();
  S.save();S.globalCompositeOperation='lighten';S.filter=`blur(${s*.15}px)`;S.beginPath();S.arc(x,y,s*.7,0,7);S.fillStyle='#e0e0e0';S.fill();S.restore();
}
function basil({A,H,S},x,y,s,rot,seed){
  const leaf=(c,k=1)=>{c.beginPath();c.moveTo(-s*k,0);c.bezierCurveTo(-s*.45*k,-s*.66*k,s*.5*k,-s*.52*k,s*k,0);c.bezierCurveTo(s*.5*k,s*.5*k,-s*.45*k,s*.62*k,-s*k,0);c.closePath()};
  const curl=1+((seed%3)-1)*.08;
  [A,H,S].forEach(c=>{c.save();c.translate(x,y);c.rotate(rot);c.scale(1,curl)});
  leaf(A);const g=A.createLinearGradient(0,-s*.5,0,s*.5);g.addColorStop(0,'#3E8233');g.addColorStop(.5,'#2A6624');g.addColorStop(1,'#184716');A.fillStyle=g;A.fill();
  A.save();leaf(A);A.clip();
  A.strokeStyle='rgba(150,200,120,.55)';A.lineWidth=s*.04;A.beginPath();A.moveTo(-s*.95,0);A.quadraticCurveTo(0,-s*.06,s*.95,0);A.stroke();
  A.lineWidth=s*.02;for(let i=-3;i<=3;i++){if(!i)continue;const px=i*s*.22;A.beginPath();A.moveTo(px,-s*.03);A.quadraticCurveTo(px+s*.12,-s*.2,px+s*.26,-s*.38);A.moveTo(px,0);A.quadraticCurveTo(px+s*.12,s*.2,px+s*.26,s*.36);A.stroke()}
  A.filter=`blur(${s*.08}px)`;A.strokeStyle='rgba(10,30,8,.75)';A.lineWidth=s*.16;leaf(A);A.stroke();
  A.restore();
  H.globalCompositeOperation='lighten';H.filter=`blur(${s*.15}px)`;leaf(H,.9);H.fillStyle='#9a9a9a';H.fill();
  S.globalCompositeOperation='lighten';S.filter=`blur(${s*.06}px)`;leaf(S,.9);S.fillStyle='#d0d0d0';S.fill();
  [A,H,S].forEach(c=>c.restore());
}
function oliveOil({S,A},cx,cy,PR){
  S.save();S.globalCompositeOperation='lighten';S.lineCap='round';
  for(let k=0;k<6;k++){S.filter=`blur(${PR*.006}px)`;S.beginPath();let a=rnd(0,7),dd=PR*rnd(.12,.6);S.moveTo(cx+Math.cos(a)*dd,cy+Math.sin(a)*dd);
    for(let j=0;j<8;j++){a+=rnd(.06,.16);dd+=rnd(-.04,.04)*PR;S.lineTo(cx+Math.cos(a)*dd,cy+Math.sin(a)*dd)}
    S.strokeStyle='#ffffff';S.lineWidth=PR*rnd(.008,.018);S.stroke()}
  S.restore();
}

// ---------- hero pizza ----------
const hero=document.getElementById('pizza');
renderScene(hero,{toppings:(L)=>{
  const {cx,cy,PR}=L;
  [[-.36,-.28,.12],[.16,-.44,.11],[.47,-.06,.1],[.3,.36,.12],[-.1,.47,.11],[-.5,.15,.1],[.03,.0,.13],[-.2,-.06,.08],[.18,.17,.09]]
    .forEach(([a,b,s],i)=>mozzarella(L,cx+a*PR,cy+b*PR,PR*s,200+i*7,rnd(0,3)));
  [[-.06,-.55],[.42,-.31],[.57,.2],[.1,.55],[-.38,.43],[-.6,-.1],[-.33,-.5],[.16,-.2],[-.2,.22],[.3,.06],[-.04,.3],[-.46,-.26]]
    .forEach(([a,b],i)=>salame(L,cx+a*PR+rnd(-4,4),cy+b*PR+rnd(-4,4),PR*rnd(.088,.1),500+i));
  [[-.04,-.32,.6],[.36,-.14,2.2],[.22,.3,-.7],[-.3,.26,1.4],[-.16,-.17,-1.9],[.54,-.42,.9],[-.55,.34,-.3],[.0,.14,2.7]]
    .forEach(([a,b,r],i)=>basil(L,cx+a*PR,cy+b*PR,PR*rnd(.075,.1),r,700+i));
  oliveOil(L,cx,cy,PR);
}});

// ---------- topping list with rendered thumbnails ----------
const items=[
  ['Salame piccante','Pikante Calabrische salami','2,50',1,'sal'],
  ['Prosciutto di Parma','24 maanden gerijpt, na de oven','3,95',0,'pro'],
  ["'Nduja di Spilinga",'Smeerbare, rokerige chilisalami','2,95',0,'ndu'],
  ['Mozzarella di bufala','Campania DOP, romig','3,50',1,'moz'],
  ['Burrata pugliese','Heel, met room, na de oven','4,50',0,'bur'],
  ['Basilico fresco','Genovese basilicum','0,75',1,'bas'],
  ['Funghi porcini','Eekhoorntjesbrood, tijm','2,95',0,'fun'],
];
const list=document.getElementById('list');
items.forEach(([n,d,p,sel,k],i)=>{
  const el=document.createElement('div');el.className='item'+(sel?' sel':'');
  el.innerHTML=`<canvas width="168" height="168"></canvas><div><div class="n">${n}</div><div class="d">${d}</div></div><div class="p">+ € ${p}<span class="tog">${sel?'✓':'+'}</span></div>`;
  list.appendChild(el);
  renderScene(el.querySelector('canvas'),{base:false,toppings:(L)=>{
    const c=84;
    if(k==='sal'){salame(L,c-18,c-14,40,900);salame(L,c+22,c+20,38,901)}
    if(k==='moz')mozzarella(L,c,c,50,910,.4);
    if(k==='bas'){basil(L,c-6,c+10,54,-.5,920);basil(L,c+22,c-22,36,.9,921)}
    if(k==='bur'){mozzarella(L,c,c,56,950,0);L.A.save();L.A.filter='blur(3px)';blob(L.A,c+4,c+4,24,.3,951);L.A.fillStyle='rgba(255,253,246,.95)';L.A.fill();L.A.restore();
      L.S.save();L.S.globalCompositeOperation='lighten';blob(L.S,c+4,c+4,22,.3,951);L.S.fillStyle='#fff';L.S.fill();L.S.restore()}
    if(k==='pro'){for(let j=0;j<3;j++){const x=58+j*20,y=64+j*16;L.A.save();L.A.filter='blur(.6px)';blob(L.A,x,y,40,.4,930+j,1.4,j);
      const g=L.A.createLinearGradient(x-40,y-30,x+40,y+30);g.addColorStop(0,'#E9A39A');g.addColorStop(.45,'#C7564F');g.addColorStop(.75,'#D9817A');g.addColorStop(1,'#F4E1D6');L.A.fillStyle=g;L.A.fill();L.A.restore();
      L.H.save();L.H.globalCompositeOperation='lighten';L.H.filter='blur(8px)';blob(L.H,x,y,36,.4,930+j,1.4,j);L.H.fillStyle=`rgb(${110+j*50},${110+j*50},${110+j*50})`;L.H.fill();L.H.restore();
      L.S.save();L.S.globalCompositeOperation='lighten';blob(L.S,x,y,36,.4,930+j,1.4,j);L.S.fillStyle='#777';L.S.fill();L.S.restore()}}
    if(k==='ndu'){for(let j=0;j<6;j++){const x=50+R()*68,y=50+R()*68,s=rnd(14,24);L.A.save();L.A.filter='blur(1.5px)';blob(L.A,x,y,s,.45,940+j);L.A.fillStyle=['#9A2414','#B23418','#7A1A0E'][j%3];L.A.fill();L.A.restore();
      L.H.save();L.H.globalCompositeOperation='lighten';L.H.filter='blur(5px)';blob(L.H,x,y,s,.45,940+j);L.H.fillStyle='#bbb';L.H.fill();L.H.restore();
      L.S.save();L.S.globalCompositeOperation='lighten';blob(L.S,x,y,s,.45,940+j);L.S.fillStyle='#ccc';L.S.fill();L.S.restore()}}
    if(k==='fun'){[[62,70,.4,30],[104,100,-.5,26]].forEach(([x,y,r,s])=>{L.A.save();L.A.translate(x,y);L.A.rotate(r);
      L.A.beginPath();L.A.ellipse(0,0,s,s*.95,0,0,7);const g=L.A.createRadialGradient(-s*.2,-s*.2,0,0,0,s);g.addColorStop(0,'#E9D9BF');g.addColorStop(.55,'#D4BE98');g.addColorStop(.8,'#8A5A33');g.addColorStop(1,'#5A361C');L.A.fillStyle=g;L.A.fill();
      L.A.fillStyle='rgba(120,80,45,.5)';L.A.fillRect(-s*.22,-s*.1,s*.44,s*.9);L.A.restore();
      L.H.save();L.H.globalCompositeOperation='lighten';L.H.filter='blur(6px)';L.H.beginPath();L.H.arc(x,y,s,0,7);L.H.fillStyle='#ccc';L.H.fill();L.H.restore()})}
  },PRf:.43});
});
