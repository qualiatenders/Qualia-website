// Anno Domini — pizza renderer v2
// Layers paint albedo (A), height (H) and material (M: r=gloss g=wrap b=sharpness a=coverage).
// One lighting pass turns that into a shaded image with soft cast shadows and AO.
const PZ=(()=>{
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
const N=[...Array(10)].map((_,i)=>makeNoise(101+i*17));

function blob(ctx,x,y,r,irr,seed,stretch=1,rot=0){
  const n=makeNoise(seed),m=makeNoise(seed+3);ctx.beginPath();
  for(let i=0;i<=120;i++){const a=i/120*Math.PI*2;
    const k=1+irr*((fbm(n,Math.cos(a)*1.2+4,Math.sin(a)*1.2+4,2)-.5)*2)+irr*.25*((m(Math.cos(a)*4+9,Math.sin(a)*4+9))-.5);
    const lx=Math.cos(a)*r*k*stretch,ly=Math.sin(a)*r*k;
    ctx.lineTo(x+lx*Math.cos(rot)-ly*Math.sin(rot),y+lx*Math.sin(rot)+ly*Math.cos(rot))}
  ctx.closePath()}
const layer=(c,fn,{blur=0,op='source-over',alpha=1}={})=>{c.save();c.globalCompositeOperation=op;c.globalAlpha=alpha;if(blur)c.filter=`blur(${blur}px)`;fn(c);c.restore()};

function render(canvas,{base=true,size=.46,toppings=()=>{},bg=null}={}){
  const W=canvas.width,cx=W/2,cy=W/2,PR=W*size,HS=PR*.12,sc=1200/W;
  const mk=()=>{const c=document.createElement('canvas');c.width=c.height=W;return c.getContext('2d',{willReadFrequently:true})};
  const A=mk(),H=mk(),M=mk();H.fillStyle='#000';H.fillRect(0,0,W,W);
  const n=W*W,Hb=new Float32Array(n),Gl=new Float32Array(n),Wr=new Float32Array(n),Ex=new Float32Array(n),alpha=new Float32Array(n);

  // blisters on the cornicione: raised domes, charred on top, browned halo
  const BH=new Float32Array(n),CH=new Float32Array(n),BR=new Float32Array(n);
  if(base){
    for(let k=0;k<520;k++){const tiny=k>=260;
      const a=rnd(0,Math.PI*2),big=!tiny&&R()<.35,d=rnd(.79,.985)*PR,br=PR*(tiny?rnd(.004,.009):big?rnd(.03,.065):rnd(.01,.028));
      const bx=cx+Math.cos(a)*d,by=cy+Math.sin(a)*d*1.01,amp=tiny?.01:big?rnd(.12,.28):rnd(.05,.12),charred=tiny||R()<(big?.6:.45),cs=rnd(.25,.6);
      const x0=Math.max(0,bx-br*2|0),x1=Math.min(W-1,bx+br*2|0),y0=Math.max(0,by-br*2|0),y1=Math.min(W-1,by+br*2|0);
      for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const i=y*W+x,q=Math.hypot(x-bx,y-by)/br;if(q>2)continue;
        BH[i]+=Math.exp(-q*q*2.4)*amp;BR[i]=Math.max(BR[i],Math.exp(-q*q*.9)*.75);
        if(charred){const e=q+(N[8](x*sc*.15,y*sc*.15)-.5)*.6;CH[i]=Math.max(CH[i],sstep(cs+.18,cs-.08,e))}}
    }
  }

  const img=A.createImageData(W,W),d=img.data;
  for(let y=0;y<W;y++)for(let x=0;x<W;x++){
    const i=y*W+x,o=i*4,dx=(x-cx)/PR,dy=(y-cy)/(PR*1.015),r=Math.hypot(dx,dy),ca=dx/(r||1),sa=dy/(r||1),X=x*sc,Y=y*sc;
    let cr=0,cg=0,cb=0,h=0,gl=.05,wr=.1,ex=.2,al=base?0:1;
    if(!base&&bg){const v=(N[6](X*.4,Y*.4)-.5)*6;cr=bg[0]+v;cg=bg[1]+v;cb=bg[2]+v}
    if(base){
      const en=.055*(fbm(N[0],ca*1.1+5,sa*1.1+5,3)-.5)+.014*(N[9](ca*5+3,sa*5+3)-.5),rr=r/(1+en);
      const rs=.765+.055*(fbm(N[1],ca*1.8+9,sa*1.8+9,3)-.5)+.02*(fbm(N[2],X*.025,Y*.025,2)-.5);
      al=sstep(1.004,.992,rr);
      if(al>0){
        const lump=fbm(N[2],X*.006,Y*.006,3),mid=fbm(N[3],X*.02,Y*.02,4),fine=N[4](X*.22,Y*.22);
        const u=clamp((rr-(rs-.06))/(1-(rs-.06))),prof=sstep(0,.42,u)*Math.pow(sstep(1.0,.6,u),.55);
        h=.1*sstep(1,.95,rr)+prof*(.55+.5*(lump-.5)+.12*(mid-.5))+BH[i]*sstep(.2,.6,prof)+.006*fine;
        let bake=clamp(.15+prof*.38+BR[i]*.45+(mid-.5)*.55+(lump-.5)*.3+sstep(.93,1,rr)*.3);
        const ramp=[[240,220,182],[232,186,118],[204,134,66],[150,82,36],[96,50,24]];
        const t=bake*3.2,k=Math.min(3,Math.floor(t)),f=clamp(t-k);
        let dr=mix(ramp[k][0],ramp[k+1][0],f),dg=mix(ramp[k][1],ramp[k+1][1],f),db=mix(ramp[k][2],ramp[k+1][2],f);
        // leopard char on blister tops, plus fine soot freckles
        const freck=0;
        const ch=Math.max(CH[i]*sstep(.15,.5,prof),freck);
        const cv=N[7](X*.3,Y*.3)*18;
        dr=mix(dr,30+cv,ch);dg=mix(dg,20+cv*.7,ch);db=mix(db,15+cv*.5,ch);
        // flour dust on the outer rim
        const fl=sstep(.62,.78,fbm(N[6],X*.018,Y*.018,3))*sstep(.86,.98,rr)*(1-ch)*.45+(N[6](X*.9,Y*.9)>.86?.25:0)*prof;
        dr=mix(dr,244,fl);dg=mix(dg,236,fl);db=mix(db,220,fl);
        cr=dr;cg=dg;cb=db;gl=.04+ch*.05;wr=.25;ex=.1;
        // San Marzano sauce, thin & caramelised at the rim
        const m=sstep(rs+.012,rs-.012,rr);
        if(m>0){
          const v=fbm(N[1],X*.008,Y*.008,5),ck=fbm(N[3],X*.05,Y*.05,3),oilN=fbm(N[7],X*.012,Y*.012,3),th=sstep(rs,rs-.07,rr);
          let sr=mix(118,192,v),sg=mix(14,40,v),sb=mix(9,22,v);
          sr+=(ck-.5)*46;sg+=(ck-.5)*12;sb+=(ck-.5)*6;
          const oz=sstep(.55,.72,oilN);sr=mix(sr,206,oz*.35);sg=mix(sg,78,oz*.35);sb=mix(sb,30,oz*.35);
          sr=mix(mix(dr,132,.75),sr,th);sg=mix(mix(dg,40,.75),sg,th);sb=mix(mix(db,20,.75),sb,th);
          cr=mix(cr,sr,m);cg=mix(cg,sg,m);cb=mix(cb,sb,m);
          h+=m*(.028+.03*(ck-.5)+.02*(v-.5));
          gl=mix(gl,.35+.4*oz,m*th);wr=mix(wr,.05,m);ex=mix(ex,.75,m);
        }
      }
    }
    Hb[i]=h*HS;Gl[i]=gl;Wr[i]=wr;Ex[i]=ex;alpha[i]=al;
    d[o]=cr;d[o+1]=cg;d[o+2]=cb;d[o+3]=255;
  }
  A.putImageData(img,0,0);
  toppings({A,H,M,cx,cy,PR,W});

  // lighting
  const ad=A.getImageData(0,0,W,W).data,hd=H.getImageData(0,0,W,W).data,md=M.getImageData(0,0,W,W).data;
  const TS=PR*.05,Ht=new Float32Array(n);for(let i=0;i<n;i++)Ht[i]=Hb[i]+hd[i*4]/255*TS;
  const blurH=boxBlur(Ht,W,Math.max(2,W/70|0)),blurS=boxBlur(Ht,W,Math.max(1,W/260|0));
  const nrm=v=>{const l=Math.hypot(...v);return v.map(a=>a/l)};
  const L1=nrm([-.5,-.62,.62]),L2=nrm([.65,.35,.7]),Hh=nrm([L1[0],L1[1],L1[2]+1]);
  const lxy=Math.hypot(L1[0],L1[1]),sx=L1[0]/lxy,sy=L1[1]/lxy,slope=L1[2]/lxy;
  const out=canvas.getContext('2d'),oi=out.createImageData(W,W),od=oi.data,steps=22,stepL=PR*.008;
  for(let y=1;y<W-1;y++)for(let x=1;x<W-1;x++){
    const i=y*W+x,o=i*4;if(alpha[i]<=0)continue;const h=Ht[i];
    const gx=(Ht[i+1]-Ht[i-1])*.5,gy=(Ht[i+W]-Ht[i-W])*.5;
    let nx=-gx,ny=-gy,nz=1;const nl=Math.hypot(nx,ny,nz);nx/=nl;ny/=nl;nz/=nl;
    const ca=md[o+3]/255,gl=mix(Gl[i],md[o]/255,ca),wr=mix(Wr[i],md[o+1]/255,ca),ex=mix(Ex[i],md[o+2]/255,ca);
    const d1=Math.max(0,(nx*L1[0]+ny*L1[1]+nz*L1[2]+wr)/(1+wr)),d2=Math.max(0,(nx*L2[0]+ny*L2[1]+nz*L2[2]+wr)/(1+wr));
    let occ=0;
    for(let k=1;k<=steps;k++){const dd=k*stepL,px=(x+sx*dd)|0,py=(y+sy*dd)|0;if(px<0||py<0||px>=W||py>=W)break;
      const s=Ht[py*W+px]-(h+dd*slope);if(s>0)occ=Math.max(occ,clamp(s/(PR*.02))*(1-k/steps*.45))}
    const sh=1-.7*occ,ao=clamp(1-(blurH[i]-h)/(PR*.06)*.6,.4,1.05)*clamp(1-(blurS[i]-h)/(PR*.012)*.35,.6,1.03);
    const nh=Math.max(0,nx*Hh[0]+ny*Hh[1]+nz*Hh[2]),e=mix(6,160,ex);
    const sp=(Math.pow(nh,e)*(e/40+.5)*.9+Math.pow(nh,6)*.06)*gl*sh*255;
    const amb=.3*ao,k1=.9*d1*sh*mix(1,ao,.4),k2=.16*d2*ao;
    od[o]=ad[o]*(amb+k1*1.04+k2*.9)+sp;od[o+1]=ad[o+1]*(amb+k1*.98+k2*.95)+sp*.97;od[o+2]=ad[o+2]*(amb+k1*.9+k2*1.05)+sp*.9;
    od[o+3]=255*alpha[i];
  }
  out.putImageData(oi,0,0);
  // photographic finish: warm falloff, slight contrast, grain
  out.save();out.globalCompositeOperation='source-atop';
  const lg=out.createRadialGradient(cx-PR*.35,cy-PR*.4,PR*.1,cx,cy,PR*1.15);lg.addColorStop(0,'rgba(255,240,215,.10)');lg.addColorStop(.6,'rgba(0,0,0,0)');lg.addColorStop(1,'rgba(30,12,4,.28)');
  out.fillStyle=lg;out.fillRect(0,0,W,W);out.restore();
  const tmp=document.createElement('canvas');tmp.width=tmp.height=W;const t=tmp.getContext('2d');t.filter='contrast(1.06) saturate(1.05)';t.drawImage(canvas,0,0);
  out.clearRect(0,0,W,W);out.drawImage(tmp,0,0);
  const gi=out.getImageData(0,0,W,W),g=gi.data,gr=mulberry(9);for(let i=0;i<g.length;i+=4){if(!g[i+3])continue;const v=(gr()-.5)*7;g[i]+=v;g[i+1]+=v;g[i+2]+=v}out.putImageData(gi,0,0);
}
function boxBlur(src,w,r){const a=new Float32Array(w*w),b=new Float32Array(w*w),q=2*r+1;
  for(let y=0;y<w;y++){let s=0;for(let x=-r;x<=r;x++)s+=src[y*w+clamp(x,0,w-1)];for(let x=0;x<w;x++){a[y*w+x]=s/q;s+=src[y*w+Math.min(w-1,x+r+1)]-src[y*w+Math.max(0,x-r)]}}
  for(let x=0;x<w;x++){let s=0;for(let y=-r;y<=r;y++)s+=a[clamp(y,0,w-1)*w+x];for(let y=0;y<w;y++){b[y*w+x]=s/q;s+=a[Math.min(w-1,y+r+1)*w+x]-a[Math.max(0,y-r)*w+x]}}
  return b}

// ---------- ingredients ----------
const mat=(gl,wr,sh,a=1)=>`rgba(${gl*255|0},${wr*255|0},${sh*255|0},${a})`;
function mozzarella({A,H,M},x,y,s,seed,rot=rnd(0,3)){
  const st=rnd(1,1.45),sd=seed;
  layer(A,c=>{blob(c,x,y,s*1.32,.42,sd,st,rot);c.fillStyle='rgba(222,140,96,.3)';c.fill()},{blur:s*.2});
  layer(A,c=>{blob(c,x,y,s*1.04,.4,sd,st,rot);c.fillStyle='rgba(238,214,178,.75)';c.fill()},{blur:s*.07});
  layer(A,c=>{blob(c,x,y,s*.95,.38,sd,st,rot);const g=c.createRadialGradient(x-s*.2,y-s*.2,0,x,y,s);g.addColorStop(0,'#FCF8EE');g.addColorStop(.7,'#F4EAD3');g.addColorStop(1,'#EEDDBA');c.fillStyle=g;c.fill()},{blur:s*.025});
  layer(A,c=>{blob(c,x,y,s*.95,.38,sd,st,rot);c.clip();
    for(let i=0;i<160;i++){c.fillStyle=R()<.5?'rgba(255,255,255,.12)':'rgba(170,140,100,.07)';c.beginPath();c.arc(x+rnd(-1.4,1.4)*s,y+rnd(-1,1)*s,rnd(s*.02,s*.06),0,7);c.fill()}
    for(let i=0;i<4;i++){const bx=x+rnd(-.55,.55)*s,by=y+rnd(-.55,.55)*s,bs=s*rnd(.08,.2);
      c.filter=`blur(${bs*.5}px)`;c.fillStyle=`rgba(${rnd(196,214)|0},${rnd(140,160)|0},${rnd(78,96)|0},${rnd(.35,.6)})`;c.beginPath();c.arc(bx,by,bs,0,7);c.fill();
      if(R()<.5){c.filter=`blur(${bs*.15}px)`;c.fillStyle='rgba(150,92,42,.55)';c.beginPath();c.arc(bx,by,bs*.35,0,7);c.fill()}}});
  layer(H,c=>{blob(c,x,y,s*.98,.38,sd,st,rot);const g=c.createRadialGradient(x,y,0,x,y,s*1.1);g.addColorStop(0,'#f2f2f2');g.addColorStop(.6,'#aaa');g.addColorStop(1,'#444');c.fillStyle=g;c.fill()},{blur:s*.3,op:'lighten'});
  layer(M,c=>{blob(c,x,y,s*1.05,.4,sd,st,rot);c.fillStyle=mat(.22,.55,.3);c.fill()},{blur:s*.08});
}
function salame({A,H,M},x,y,s,seed){
  const r2=mulberry(seed);
  layer(A,c=>{c.beginPath();c.arc(x+s*.06,y+s*.06,s*1.18,0,7);c.fillStyle='rgba(196,66,20,.36)';c.fill()},{blur:s*.22});
  layer(A,c=>{blob(c,x,y,s,.09,seed,1.08,seed);c.fillStyle='#3A0B06';c.fill();blob(c,x,y,s*.92,.09,seed,1.08,seed);c.clip();
    const g=c.createRadialGradient(x+s*.1,y+s*.1,s*.05,x,y,s);g.addColorStop(0,'#8E2618');g.addColorStop(.7,'#7A1C10');g.addColorStop(1,'#4E0E08');c.fillStyle=g;c.fillRect(x-s,y-s,s*2,s*2);
    for(let i=0;i<46;i++){const a=r2()*7,dd=Math.sqrt(r2())*s*.82;blob(c,x+Math.cos(a)*dd,y+Math.sin(a)*dd,s*(.025+r2()*.05),.5,seed*7+i);c.fillStyle=`rgba(${196+r2()*24|0},${118+r2()*30|0},${100+r2()*25|0},${.22+r2()*.3})`;c.fill()}
    for(let i=0;i<36;i++){const a=r2()*7,dd=Math.sqrt(r2())*s*.82;c.fillStyle='rgba(40,6,3,.55)';c.beginPath();c.arc(x+Math.cos(a)*dd,y+Math.sin(a)*dd,s*(.01+r2()*.015),0,7);c.fill()}
    const og=c.createRadialGradient(x,y,0,x,y,s*.62);og.addColorStop(0,'rgba(220,80,26,.5)');og.addColorStop(1,'rgba(220,80,26,0)');c.fillStyle=og;c.fillRect(x-s,y-s,s*2,s*2)});
  layer(A,c=>{c.lineWidth=s*.08;c.strokeStyle='rgba(22,5,2,.7)';blob(c,x,y,s*.95,.09,seed,1.08,seed);c.stroke();
    for(let i=0;i<5;i++){const a=r2()*7;c.fillStyle='rgba(20,5,2,.7)';c.beginPath();c.arc(x+Math.cos(a)*s*.86,y+Math.sin(a)*s*.86,s*(.08+r2()*.1),0,7);c.fill()}},{blur:s*.05});
  layer(H,c=>{blob(c,x,y,s*.96,.09,seed,1.08,seed);c.fillStyle='#606060';c.fill();c.lineWidth=s*.2;c.strokeStyle='#b8b8b8';blob(c,x,y,s*.84,.09,seed,1.08,seed);c.stroke()},{blur:s*.12,op:'lighten'});
  layer(M,c=>{blob(c,x,y,s,.09,seed,1.08,seed);c.fillStyle=mat(.3,.1,.5);c.fill();c.beginPath();c.arc(x,y,s*.62,0,7);c.fillStyle=mat(.95,.05,.9);c.fill()},{blur:s*.1});
}
function basil({A,H,M},x,y,s,rot,seed){
  const r2=mulberry(seed),bend=(r2()-.5)*.5,w=.5+r2()*.15;
  const leaf=(c,k=1)=>{c.beginPath();c.moveTo(-s*k,0);c.bezierCurveTo(-s*.45*k,-s*(w+.12+bend)*k,s*.5*k,-s*(w+bend*.5)*k,s*k,s*bend*.2);c.bezierCurveTo(s*.5*k,s*(w-bend*.4)*k,-s*.45*k,s*(w+.08-bend)*k,-s*k,0);c.closePath()};
  [A,H,M].forEach(c=>{c.save();c.translate(x,y);c.rotate(rot)});
  leaf(A);const g=A.createLinearGradient(0,-s*.5,0,s*.5);g.addColorStop(0,'#2F5F26');g.addColorStop(.5,'#21481B');g.addColorStop(1,'#122E0F');A.fillStyle=g;A.fill();
  A.save();leaf(A);A.clip();
  for(let i=0;i<6;i++){A.filter=`blur(${s*.12}px)`;A.fillStyle=`rgba(${R()<.5?'14,34,10':'70,110,40'},${rnd(.25,.5)})`;A.beginPath();A.arc(rnd(-.8,.8)*s,rnd(-.4,.4)*s,s*rnd(.12,.28),0,7);A.fill()}
  A.filter='none';A.strokeStyle='rgba(120,155,90,.35)';A.lineWidth=s*.03;A.beginPath();A.moveTo(-s*.95,0);A.quadraticCurveTo(0,-s*.06+s*bend*.1,s*.95,s*bend*.2);A.stroke();
  A.lineWidth=s*.016;A.strokeStyle='rgba(120,165,90,.35)';for(let i=-3;i<=3;i++){if(!i)continue;const px=i*s*.22;A.beginPath();A.moveTo(px,-s*.03);A.quadraticCurveTo(px+s*.12,-s*.2,px+s*.27,-s*.4);A.moveTo(px,0);A.quadraticCurveTo(px+s*.12,s*.2,px+s*.27,s*.38);A.stroke()}
  A.filter=`blur(${s*.1}px)`;A.strokeStyle='rgba(8,24,6,.8)';A.lineWidth=s*.18;leaf(A);A.stroke();
  A.restore();
  H.globalCompositeOperation='lighten';H.filter=`blur(${s*.14}px)`;leaf(H,.92);H.fillStyle='#8a8a8a';H.fill();
  M.filter=`blur(${s*.05}px)`;leaf(M,.95);M.fillStyle=mat(.55,.35,.6);M.fill();
  [A,H,M].forEach(c=>c.restore());
}
function oliveOil({A,M},cx,cy,PR){
  for(let k=0;k<7;k++){let a=rnd(0,7),dd=PR*rnd(.1,.62);const pts=[[cx+Math.cos(a)*dd,cy+Math.sin(a)*dd]];
    for(let j=0;j<9;j++){a+=rnd(.05,.14);dd+=rnd(-.04,.04)*PR;pts.push([cx+Math.cos(a)*dd,cy+Math.sin(a)*dd])}
    const lw=PR*rnd(.008,.02),path=c=>{c.beginPath();pts.forEach(([px,py],j)=>j?c.lineTo(px,py):c.moveTo(px,py));c.lineCap='round';c.lineJoin='round';c.lineWidth=lw};
    layer(A,c=>{path(c);c.strokeStyle='rgba(230,170,50,.16)';c.stroke()},{blur:lw*.4});
    layer(M,c=>{path(c);c.strokeStyle=mat(1,.05,1);c.stroke()},{blur:lw*.25})}
}
function pepper({A},cx,cy,PR,count){for(let i=0;i<count;i++){const a=rnd(0,7),d=Math.sqrt(R())*PR*.74;A.fillStyle='rgba(25,15,10,.7)';A.beginPath();A.arc(cx+Math.cos(a)*d,cy+Math.sin(a)*d,PR*rnd(.002,.005),0,7);A.fill()}}

// "Diavola di Kampen" — shared by all screens
function diavola(L){
  const {cx,cy,PR}=L;
  [[-.36,-.27,.12],[.15,-.45,.11],[.47,-.05,.1],[.3,.37,.12],[-.1,.48,.1],[-.5,.16,.1],[.04,.01,.13],[-.2,-.05,.08],[.19,.18,.09],[-.05,-.62,.07]]
    .forEach(([a,b,s],i)=>mozzarella(L,cx+(a+rnd(-.03,.03))*PR,cy+(b+rnd(-.03,.03))*PR,PR*s,200+i*7));
  [[-.06,-.55],[.42,-.31],[.57,.2],[.1,.55],[-.38,.43],[-.6,-.1],[-.33,-.5],[.16,-.2],[-.2,.22],[.3,.06],[-.04,.3],[-.46,-.26],[.4,.48]]
    .forEach(([a,b],i)=>salame(L,cx+(a+rnd(-.035,.035))*PR,cy+(b+rnd(-.035,.035))*PR,PR*rnd(.085,.11),500+i));
  [[-.04,-.32,.6],[.36,-.14,2.2],[.22,.3,-.7],[-.3,.26,1.4],[-.16,-.17,-1.9],[.54,-.42,.9],[-.55,.34,-.3],[.0,.14,2.7]]
    .forEach(([a,b,r],i)=>basil(L,cx+a*PR,cy+b*PR,PR*rnd(.085,.115),r,700+i));
  oliveOil(L,cx,cy,PR);pepper(L,cx,cy,PR,60);
}
return {render,mozzarella,salame,basil,oliveOil,blob,layer,diavola,rnd,mulberry,mat};
})();
