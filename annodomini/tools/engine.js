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

function render(canvas,{base=true,size=.46,toppings=()=>{},bg=null,PRpx=null}={}){
  const W=canvas.width,cx=W/2,cy=W/2,PR=PRpx||W*size,HS=PR*.12,sc=1200/W;
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
    let cr=0,cg=0,cb=0,h=0,gl=.05,wr=.1,ex=.2,al=base?0:(bg?1:0);
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
    d[o]=cr;d[o+1]=cg;d[o+2]=cb;d[o+3]=(base||bg)?255:0;
  }
  A.putImageData(img,0,0);
  toppings({A,H,M,cx,cy,PR,W});

  // lighting
  const ad=A.getImageData(0,0,W,W).data,hd=H.getImageData(0,0,W,W).data,md=M.getImageData(0,0,W,W).data;
  if(!base&&!bg)for(let i=0;i<n;i++)alpha[i]=ad[i*4+3]/255;
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
  if(base){out.save();out.globalCompositeOperation='source-atop';
  const lg=out.createRadialGradient(cx-PR*.35,cy-PR*.4,PR*.1,cx,cy,PR*1.15);lg.addColorStop(0,'rgba(255,240,215,.10)');lg.addColorStop(.6,'rgba(0,0,0,0)');lg.addColorStop(1,'rgba(30,12,4,.28)');
  out.fillStyle=lg;out.fillRect(0,0,W,W);out.restore();}
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
function basil({A,H,M},x,y,s,rot,seed,pal=['#2F5F26','#21481B','#122E0F']){
  const r2=mulberry(seed),bend=(r2()-.5)*.5,w=.5+r2()*.15;
  const leaf=(c,k=1)=>{c.beginPath();c.moveTo(-s*k,0);c.bezierCurveTo(-s*.45*k,-s*(w+.12+bend)*k,s*.5*k,-s*(w+bend*.5)*k,s*k,s*bend*.2);c.bezierCurveTo(s*.5*k,s*(w-bend*.4)*k,-s*.45*k,s*(w+.08-bend)*k,-s*k,0);c.closePath()};
  [A,H,M].forEach(c=>{c.save();c.translate(x,y);c.rotate(rot)});
  leaf(A);const g=A.createLinearGradient(0,-s*.5,0,s*.5);g.addColorStop(0,pal[0]);g.addColorStop(.5,pal[1]);g.addColorStop(1,pal[2]);A.fillStyle=g;A.fill();
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

// ---------- extended pantry ----------
function burrata(L,x,y,s,seed){
  const {A,H,M}=L;
  layer(A,c=>{blob(c,x,y,s*1.08,.12,seed);c.fillStyle='rgba(120,90,60,.25)';c.fill()},{blur:s*.12});
  layer(A,c=>{blob(c,x,y,s,.1,seed);const g=c.createRadialGradient(x-s*.3,y-s*.35,s*.05,x,y,s);g.addColorStop(0,'#FFFEF9');g.addColorStop(.7,'#F6F0E2');g.addColorStop(1,'#E9DDC4');c.fillStyle=g;c.fill();
    c.clip();for(let i=0;i<120;i++){c.fillStyle=R()<.5?'rgba(255,255,255,.18)':'rgba(190,170,140,.06)';c.beginPath();c.arc(x+rnd(-1,1)*s,y+rnd(-1,1)*s,rnd(s*.02,s*.05),0,7);c.fill()}});
  // torn open, stracciatella spilling
  const ox=x+s*.12,oy=y+s*.1;
  layer(A,c=>{blob(c,ox,oy,s*.46,.45,seed+1,1.2,.6);c.fillStyle='rgba(250,246,236,1)';c.fill();blob(c,ox,oy,s*.36,.5,seed+2,1.2,.6);c.fillStyle='rgba(244,236,218,1)';c.fill()},{blur:s*.03});
  layer(A,c=>{blob(c,ox,oy,s*.4,.5,seed+3,1.2,.6);c.clip();for(let i=0;i<60;i++){c.strokeStyle='rgba(255,255,255,.55)';c.lineWidth=s*.012;c.beginPath();const a=rnd(0,7),px=ox+rnd(-.4,.4)*s,py=oy+rnd(-.3,.3)*s;c.moveTo(px,py);c.lineTo(px+Math.cos(a)*s*.12,py+Math.sin(a)*s*.12);c.stroke()}});
  layer(H,c=>{blob(c,x,y,s,.1,seed);const g=c.createRadialGradient(x-s*.1,y-s*.1,0,x,y,s);g.addColorStop(0,'#fff');g.addColorStop(.75,'#c8c8c8');g.addColorStop(1,'#333');c.fillStyle=g;c.fill();blob(c,ox,oy,s*.38,.5,seed+2,1.2,.6);c.fillStyle='#8a8a8a';c.globalCompositeOperation='darken';c.fill()},{blur:s*.08,op:'lighten'});
  layer(M,c=>{blob(c,x,y,s,.1,seed);c.fillStyle=mat(.45,.6,.4);c.fill();blob(c,ox,oy,s*.4,.5,seed+2,1.2,.6);c.fillStyle=mat(.85,.5,.75);c.fill()},{blur:s*.04});
  // a few drops of olive oil and pepper on top
  layer(M,c=>{for(let i=0;i<4;i++){c.beginPath();c.arc(x+rnd(-.5,.5)*s,y+rnd(-.5,.5)*s,s*rnd(.04,.08),0,7);c.fillStyle=mat(1,.1,1);c.fill()}},{blur:s*.02});
  layer(A,c=>{for(let i=0;i<40;i++){c.fillStyle='rgba(30,20,12,.75)';c.beginPath();c.arc(x+rnd(-.7,.7)*s,y+rnd(-.7,.7)*s,s*rnd(.008,.016),0,7);c.fill()}});
}
function parmigiano({A,H,M},x,y,s,seed){
  const rot=rnd(0,3),st=rnd(1.6,2.2);
  layer(A,c=>{blob(c,x,y,s,.3,seed,st,rot);const g=c.createLinearGradient(x-s,y-s,x+s,y+s);g.addColorStop(0,'#F2E6C2');g.addColorStop(.5,'#E3CF96');g.addColorStop(1,'#CFB473');c.fillStyle=g;c.fill();
    c.clip();for(let i=0;i<40;i++){c.fillStyle=R()<.6?'rgba(255,250,225,.35)':'rgba(160,130,70,.2)';c.beginPath();c.arc(x+rnd(-1.5,1.5)*s,y+rnd(-1,1)*s,s*rnd(.03,.08),0,7);c.fill()}},{blur:s*.02});
  layer(H,c=>{blob(c,x,y,s,.3,seed,st,rot);const g=c.createLinearGradient(x+Math.cos(rot)*s*st,y+Math.sin(rot)*s*st,x-Math.cos(rot)*s*st,y-Math.sin(rot)*s*st);g.addColorStop(0,'#ddd');g.addColorStop(.5,'#888');g.addColorStop(1,'#bbb');c.fillStyle=g;c.fill()},{blur:s*.12,op:'lighten'});
  layer(M,c=>{blob(c,x,y,s,.3,seed,st,rot);c.fillStyle=mat(.25,.5,.4);c.fill()});
}
function gorgonzola({A,H,M},x,y,s,seed){
  layer(A,c=>{blob(c,x,y,s*1.25,.4,seed);c.fillStyle='rgba(230,200,160,.4)';c.fill()},{blur:s*.25});
  layer(A,c=>{blob(c,x,y,s,.42,seed);c.fillStyle='#F1EBDC';c.fill();c.clip();
    for(let i=0;i<14;i++){c.fillStyle=`rgba(${70+R()*30|0},${100+R()*30|0},${96+R()*30|0},${rnd(.5,.85)})`;blob(c,x+rnd(-.8,.8)*s,y+rnd(-.8,.8)*s,s*rnd(.05,.13),.6,seed*3+i);c.fill()}
    for(let i=0;i<3;i++){c.filter=`blur(${s*.1}px)`;c.fillStyle='rgba(200,150,80,.35)';c.beginPath();c.arc(x+rnd(-.5,.5)*s,y+rnd(-.5,.5)*s,s*.2,0,7);c.fill()}},{blur:s*.04});
  layer(H,c=>{blob(c,x,y,s,.42,seed);c.fillStyle='#bdbdbd';c.fill()},{blur:s*.3,op:'lighten'});
  layer(M,c=>{blob(c,x,y,s*1.05,.42,seed);c.fillStyle=mat(.4,.55,.4);c.fill()},{blur:s*.08});
}
function prosciutto({A,H,M},x,y,s,seed){
  const rot=rnd(0,3),st=rnd(1.5,1.9);
  layer(A,c=>{blob(c,x,y,s,.38,seed,st,rot);const g=c.createLinearGradient(x-Math.sin(rot)*s,y+Math.cos(rot)*s,x+Math.sin(rot)*s,y-Math.cos(rot)*s);
    g.addColorStop(0,'#F3E2D8');g.addColorStop(.16,'#EBC6BA');g.addColorStop(.3,'#D46E66');g.addColorStop(.6,'#B84A45');g.addColorStop(.85,'#C9625B');g.addColorStop(1,'#E6A8A0');c.fillStyle=g;c.fill();
    c.clip();for(let i=0;i<5;i++){c.strokeStyle=`rgba(${R()<.5?'255,230,225':'140,40,40'},${rnd(.15,.35)})`;c.lineWidth=s*rnd(.05,.12);c.filter=`blur(${s*.05}px)`;c.beginPath();const o=rnd(-.6,.6)*s;c.moveTo(x-Math.cos(rot)*s*2+(-Math.sin(rot))*o,y-Math.sin(rot)*s*2+Math.cos(rot)*o);c.quadraticCurveTo(x+rnd(-.3,.3)*s,y+rnd(-.3,.3)*s,x+Math.cos(rot)*s*2-Math.sin(rot)*o,y+Math.sin(rot)*s*2+Math.cos(rot)*o);c.stroke()}},{blur:s*.02});
  layer(H,c=>{blob(c,x,y,s,.38,seed,st,rot);c.fillStyle='#777';c.fill();c.clip();c.lineWidth=s*.35;
    for(let i=0;i<3;i++){c.strokeStyle='#e8e8e8';const o=(i-1)*s*.55;c.beginPath();c.moveTo(x-Math.cos(rot)*s*2-Math.sin(rot)*o,y-Math.sin(rot)*s*2+Math.cos(rot)*o);c.quadraticCurveTo(x-Math.sin(rot)*o*1.4,y+Math.cos(rot)*o*1.4,x+Math.cos(rot)*s*2-Math.sin(rot)*o,y+Math.sin(rot)*s*2+Math.cos(rot)*o);c.stroke()}},{blur:s*.18,op:'lighten'});
  layer(M,c=>{blob(c,x,y,s,.38,seed,st,rot);c.fillStyle=mat(.5,.45,.55);c.fill()});
}
function nduja({A,H,M},x,y,s,seed){
  layer(A,c=>{blob(c,x,y,s*1.4,.4,seed);c.fillStyle='rgba(215,80,24,.45)';c.fill()},{blur:s*.35});
  layer(A,c=>{blob(c,x,y,s,.45,seed);const g=c.createRadialGradient(x-s*.2,y-s*.2,0,x,y,s);g.addColorStop(0,'#B83A1C');g.addColorStop(.6,'#962611');g.addColorStop(1,'#6E180A');c.fillStyle=g;c.fill();c.clip();
    for(let i=0;i<20;i++){c.fillStyle=R()<.5?'rgba(60,8,4,.5)':'rgba(230,110,50,.35)';c.beginPath();c.arc(x+rnd(-1,1)*s,y+rnd(-1,1)*s,s*rnd(.04,.1),0,7);c.fill()}},{blur:s*.05});
  layer(H,c=>{blob(c,x,y,s,.45,seed);c.fillStyle='#c8c8c8';c.fill()},{blur:s*.35,op:'lighten'});
  layer(M,c=>{blob(c,x,y,s*1.1,.45,seed);c.fillStyle=mat(.85,.1,.8);c.fill()},{blur:s*.1});
}
function salsiccia({A,H,M},x,y,s,seed){
  const r2=mulberry(seed);
  for(let k=0;k<4;k++){const px=x+(r2()-.5)*s*.9,py=y+(r2()-.5)*s*.9,ps=s*(.35+r2()*.3);
    layer(A,c=>{blob(c,px,py,ps,.5,seed*5+k);const g=c.createRadialGradient(px-ps*.3,py-ps*.3,0,px,py,ps);g.addColorStop(0,'#B98962');g.addColorStop(.6,'#8E5B3A');g.addColorStop(1,'#5A341E');c.fillStyle=g;c.fill();
      c.clip();for(let i=0;i<8;i++){c.fillStyle=R()<.6?'rgba(60,30,15,.5)':'rgba(220,190,150,.5)';c.beginPath();c.arc(px+rnd(-1,1)*ps,py+rnd(-1,1)*ps,ps*rnd(.06,.14),0,7);c.fill()}},{blur:s*.02});
    layer(H,c=>{blob(c,px,py,ps,.5,seed*5+k);c.fillStyle='#bbb';c.fill()},{blur:ps*.4,op:'lighten'});
    layer(M,c=>{blob(c,px,py,ps,.5,seed*5+k);c.fillStyle=mat(.45,.2,.5);c.fill()})}
  layer(A,c=>{for(let i=0;i<6;i++){c.fillStyle='rgba(150,140,80,.9)';c.beginPath();c.ellipse(x+rnd(-.5,.5)*s,y+rnd(-.5,.5)*s,s*.05,s*.018,rnd(0,3),0,7);c.fill()}});
}
function funghi({A,H,M},x,y,s,seed){
  const rot=rnd(0,7);
  const shape=c=>{c.save();c.translate(x,y);c.rotate(rot);c.beginPath();c.moveTo(-s,s*.05);c.bezierCurveTo(-s,-s*.9,s,-s*.9,s,s*.05);c.bezierCurveTo(s*.7,s*.25,s*.45,s*.15,s*.3,s*.2);
    c.lineTo(s*.34,s*.9);c.quadraticCurveTo(0,s*1.02,-s*.34,s*.9);c.lineTo(-s*.3,s*.2);c.bezierCurveTo(-s*.45,s*.15,-s*.7,s*.25,-s,s*.05);c.closePath();c.restore()};
  layer(A,c=>{shape(c);c.fillStyle='#6E4A2E';c.fill()},{blur:s*.02});
  layer(A,c=>{c.save();c.translate(x,y);c.rotate(rot);c.scale(.88,.86);c.translate(-x,-y);shape(c);c.restore();const g=c.createRadialGradient(x,y,0,x,y,s);g.addColorStop(0,'#E4D2B0');g.addColorStop(.7,'#CDB58C');g.addColorStop(1,'#A98858');c.fillStyle=g;c.fill();
    c.clip();c.save();c.translate(x,y);c.rotate(rot);for(let i=0;i<14;i++){c.strokeStyle='rgba(120,90,55,.35)';c.lineWidth=s*.02;c.beginPath();const a=Math.PI+i/13*Math.PI;c.moveTo(Math.cos(a)*s*.25,Math.sin(a)*s*.1);c.lineTo(Math.cos(a)*s*.8,Math.sin(a)*s*.62);c.stroke()}
    c.fillStyle='rgba(150,100,50,.4)';c.filter=`blur(${s*.1}px)`;c.beginPath();c.arc(rnd(-.4,.4)*s,-s*.3,s*.25,0,7);c.fill();c.restore()},{blur:s*.01});
  layer(H,c=>{shape(c);c.fillStyle='#909090';c.fill();c.lineWidth=s*.12;c.strokeStyle='#cfcfcf';shape(c);c.stroke()},{blur:s*.1,op:'lighten'});
  layer(M,c=>{shape(c);c.fillStyle=mat(.45,.25,.55);c.fill()});
}
function pomodorino({A,H,M},x,y,s,seed){
  const rot=rnd(0,7),st=rnd(1.05,1.18);
  layer(A,c=>{blob(c,x,y,s*1.2,.1,seed,st,rot);c.fillStyle='rgba(190,40,20,.4)';c.fill()},{blur:s*.2});
  layer(A,c=>{blob(c,x,y,s,.06,seed,st,rot);c.fillStyle='#B01E12';c.fill();blob(c,x,y,s*.85,.06,seed,st,rot);const g=c.createRadialGradient(x,y,0,x,y,s);g.addColorStop(0,'#E35A3A');g.addColorStop(.6,'#D03A22');g.addColorStop(1,'#B5261A');c.fillStyle=g;c.fill();
    c.save();c.translate(x,y);c.rotate(rot);for(let i=0;i<3;i++){const a=i/3*Math.PI*2+.4;c.save();c.rotate(a);c.beginPath();c.ellipse(s*.42,0,s*.3,s*.2,0,0,7);c.fillStyle='rgba(240,140,70,.75)';c.fill();
      for(let k=0;k<5;k++){c.fillStyle='rgba(250,220,140,.9)';c.beginPath();c.ellipse(s*(.28+k*.06),(k%2-.5)*s*.12,s*.04,s*.025,.5,0,7);c.fill()}c.restore()}
    c.fillStyle='rgba(255,170,120,.6)';c.beginPath();c.arc(0,0,s*.13,0,7);c.fill();c.restore();
    for(let i=0;i<3;i++){c.fillStyle='rgba(50,15,8,.45)';c.filter=`blur(${s*.04}px)`;const a=rnd(0,7);c.beginPath();c.arc(x+Math.cos(a)*s*.9,y+Math.sin(a)*s*.9,s*rnd(.06,.12),0,7);c.fill()}});
  layer(H,c=>{blob(c,x,y,s,.06,seed,st,rot);c.fillStyle='#d4d4d4';c.fill()},{blur:s*.3,op:'lighten'});
  layer(M,c=>{blob(c,x,y,s,.06,seed,st,rot);c.fillStyle=mat(.95,.15,.9);c.fill()});
}
function oliva({A,H,M},x,y,s,seed){
  const rot=rnd(0,3),st=rnd(1.2,1.4);
  layer(A,c=>{blob(c,x,y,s,.08,seed,st,rot);const g=c.createRadialGradient(x-s*.3,y-s*.3,0,x,y,s*1.3);g.addColorStop(0,'#5E4049');g.addColorStop(.6,'#3A2630');g.addColorStop(1,'#20141A');c.fillStyle=g;c.fill();
    c.beginPath();c.ellipse(x+s*.15,y+s*.1,s*.22,s*.16,rot,0,7);c.fillStyle='rgba(120,90,80,.55)';c.fill()},{blur:s*.04});
  layer(H,c=>{blob(c,x,y,s,.08,seed,st,rot);c.fillStyle='#f0f0f0';c.fill()},{blur:s*.45,op:'lighten'});
  layer(M,c=>{blob(c,x,y,s,.08,seed,st,rot);c.fillStyle=mat(1,.1,1);c.fill()});
}
function rucola({A,H,M},x,y,s,rot,seed){
  const r2=mulberry(seed),lobes=5+(r2()*3|0);
  const leaf=c=>{c.beginPath();c.moveTo(-s,0);
    for(let i=0;i<=lobes;i++){const t=i/lobes,px=-s+t*2*s,w=s*(.12+.28*Math.sin(Math.PI*Math.pow(t,.8)))*(i%2?1.35:.8);c.quadraticCurveTo(px-s/lobes*.5,-w*1.2,px,-w*.35)}
    for(let i=lobes;i>=0;i--){const t=i/lobes,px=-s+t*2*s,w=s*(.12+.28*Math.sin(Math.PI*Math.pow(t,.8)))*(i%2?.8:1.35);c.quadraticCurveTo(px+s/lobes*.5,w*1.2,px,w*.35)}
    c.closePath()};
  [A,H,M].forEach(c=>{c.save();c.translate(x,y);c.rotate(rot)});
  leaf(A);const g=A.createLinearGradient(-s,0,s,0);g.addColorStop(0,'#3F6E25');g.addColorStop(.6,'#4E8430');g.addColorStop(1,'#5E9138');A.fillStyle=g;A.fill();
  A.save();leaf(A);A.clip();A.strokeStyle='rgba(200,230,160,.6)';A.lineWidth=s*.04;A.beginPath();A.moveTo(-s*1.1,0);A.lineTo(s,0);A.stroke();
  A.filter=`blur(${s*.06}px)`;A.strokeStyle='rgba(20,45,10,.5)';A.lineWidth=s*.12;leaf(A);A.stroke();A.restore();
  A.strokeStyle='#5C8A3A';A.lineWidth=s*.05;A.beginPath();A.moveTo(-s,0);A.lineTo(-s*1.35,s*.05);A.stroke();
  H.globalCompositeOperation='lighten';H.filter=`blur(${s*.1}px)`;leaf(H);H.fillStyle='#a0a0a0';H.fill();
  M.filter=`blur(${s*.03}px)`;leaf(M);M.fillStyle=mat(.5,.4,.6);M.fill();
  [A,H,M].forEach(c=>c.restore());
}
function cipolla({A,H,M},x,y,s,seed){
  const a0=rnd(0,7),span=rnd(2.4,4.2),rr=s*rnd(.75,1),w=s*rnd(.14,.2);
  const arc=(c,lw)=>{c.beginPath();c.ellipse(x,y,rr,rr*rnd(.85,1),0,a0,a0+span);c.lineWidth=lw;c.lineCap='round';};
  layer(A,c=>{arc(c,w);c.strokeStyle='#7E2E5C';c.stroke();arc(c,w*.55);c.strokeStyle='#C78AAE';c.stroke();arc(c,w*.25);c.strokeStyle='rgba(245,225,235,.85)';c.stroke()},{blur:s*.015});
  layer(A,c=>{arc(c,w);c.strokeStyle='rgba(110,50,20,.35)';c.setLineDash([s*.15,s*.3]);c.stroke()},{blur:s*.05});
  layer(H,c=>{arc(c,w);c.strokeStyle='#bbb';c.stroke()},{blur:w*.4,op:'lighten'});
  layer(M,c=>{arc(c,w);c.strokeStyle=mat(.75,.45,.8);c.stroke()});
}
function tartufo({A,H,M},x,y,s,seed){
  const st=rnd(1,1.2),rot=rnd(0,3);
  layer(A,c=>{blob(c,x,y,s,.14,seed,st,rot);c.fillStyle='#2E2019';c.fill();c.clip();
    const g=c.createRadialGradient(x,y,0,x,y,s);g.addColorStop(0,'#4A362A');g.addColorStop(1,'#2A1C15');c.fillStyle=g;c.fillRect(x-s*2,y-s*2,s*4,s*4);
    c.strokeStyle='rgba(205,190,170,.75)';c.lineCap='round';
    for(let i=0;i<9;i++){c.lineWidth=s*rnd(.02,.045);c.beginPath();let px=x+rnd(-1,1)*s,py=y+rnd(-1,1)*s;c.moveTo(px,py);for(let k=0;k<5;k++){px+=rnd(-.35,.35)*s;py+=rnd(-.35,.35)*s;c.lineTo(px,py)}c.stroke()}},{blur:s*.015});
  layer(A,c=>{blob(c,x,y,s*1.02,.14,seed,st,rot);c.lineWidth=s*.1;c.strokeStyle='rgba(20,12,8,.9)';c.stroke()},{blur:s*.03});
  layer(H,c=>{blob(c,x,y,s,.14,seed,st,rot);c.fillStyle='#8d8d8d';c.fill()},{blur:s*.15,op:'lighten'});
  layer(M,c=>{blob(c,x,y,s,.14,seed,st,rot);c.fillStyle=mat(.4,.2,.55);c.fill()});
}
function drizzle({A,H,M},cx,cy,PR,{color,alpha=.7,width=.014,count=5,seed=1}){
  const r2=mulberry(seed);
  for(let k=0;k<count;k++){let a=r2()*7,dd=PR*(.15+r2()*.45);const pts=[];
    for(let j=0;j<40;j++){a+=.035+r2()*.03;dd+=Math.sin(j*.5+k)*PR*.012;pts.push([cx+Math.cos(a)*dd,cy+Math.sin(a)*dd])}
    const lw=PR*width*(.7+r2()*.6),path=c=>{c.beginPath();pts.forEach(([px,py],j)=>j?c.lineTo(px,py):c.moveTo(px,py));c.lineCap='round';c.lineJoin='round';c.lineWidth=lw};
    layer(A,c=>{path(c);c.strokeStyle=color;c.globalAlpha=alpha;c.stroke()},{blur:lw*.12});
    layer(H,c=>{path(c);c.strokeStyle='#666';c.stroke()},{blur:lw*.35,op:'lighten'});
    layer(M,c=>{path(c);c.strokeStyle=mat(1,.1,1);c.stroke()})}
}
function flakes({A,H,M},cx,cy,PR,count,seed){
  const r2=mulberry(seed);
  for(let i=0;i<count;i++){const a=r2()*7,d=Math.sqrt(r2())*PR*.72,x=cx+Math.cos(a)*d,y=cy+Math.sin(a)*d,s=PR*(.006+r2()*.01),seedy=r2()<.3;
    layer(A,c=>{blob(c,x,y,s,.5,seed*100+i,1.6,r2()*3);c.fillStyle=seedy?'#E8C77A':['#B3200F','#C9361A','#8E180B'][i%3];c.fill()});
    layer(H,c=>{blob(c,x,y,s,.5,seed*100+i,1.6,0);c.fillStyle='#999';c.fill()},{op:'lighten',blur:s*.3});
    layer(M,c=>{blob(c,x,y,s,.5,seed*100+i,1.6,0);c.fillStyle=mat(.4,.2,.5);c.fill()})}
}

function ham({A,H,M},x,y,s,seed){
  const rot=rnd(0,3),st=rnd(1.2,1.45);
  layer(A,c=>{blob(c,x,y,s,.22,seed,st,rot);const g=c.createRadialGradient(x-s*.2,y-s*.2,0,x,y,s*1.2);g.addColorStop(0,'#F0B3AE');g.addColorStop(.6,'#E39A95');g.addColorStop(1,'#D58580');c.fillStyle=g;c.fill();
    c.clip();c.lineWidth=s*.16;c.strokeStyle='rgba(250,236,230,.9)';blob(c,x,y,s*.98,.22,seed,st,rot);c.stroke();
    for(let i=0;i<20;i++){c.fillStyle=R()<.5?'rgba(255,220,215,.25)':'rgba(190,100,95,.15)';c.beginPath();c.arc(x+rnd(-1.3,1.3)*s,y+rnd(-1,1)*s,s*rnd(.05,.14),0,7);c.fill()}},{blur:s*.015});
  layer(H,c=>{blob(c,x,y,s,.22,seed,st,rot);c.fillStyle='#7a7a7a';c.fill();c.lineWidth=s*.3;c.strokeStyle='#d0d0d0';c.beginPath();c.moveTo(x-s*st,y+rnd(-.3,.3)*s);c.quadraticCurveTo(x,y+rnd(-.5,.5)*s,x+s*st,y+rnd(-.3,.3)*s);c.stroke()},{blur:s*.2,op:'lighten'});
  layer(M,c=>{blob(c,x,y,s,.22,seed,st,rot);c.fillStyle=mat(.45,.4,.5);c.fill()});
}
function spek({A,H,M},x,y,s,seed){
  const r2=mulberry(seed);
  for(let k=0;k<4;k++){const px=x+(r2()-.5)*s*1.1,py=y+(r2()-.5)*s*1.1,w=s*(.3+r2()*.16),rot=r2()*3;
    const box=c=>{c.save();c.translate(px,py);c.rotate(rot);c.beginPath();c.roundRect(-w/2,-w/2,w,w,w*.22);c.restore()};
    layer(A,c=>{box(c);c.clip();c.save();c.translate(px,py);c.rotate(rot);
      c.fillStyle='#B84A3E';c.fillRect(-w,-w,w*2,w*2);c.fillStyle='#F2DCCB';c.fillRect(-w,-w*.12,w*2,w*.26);c.fillStyle='#EBD0BC';c.fillRect(-w,w*.32,w*2,w*.14);
      c.fillStyle='rgba(120,50,20,.45)';c.filter=`blur(${w*.12}px)`;c.fillRect(-w,-w,w*2,w*.3);c.restore()},{blur:s*.01});
    layer(A,c=>{box(c);c.lineWidth=w*.12;c.strokeStyle='rgba(110,45,20,.6)';c.stroke()},{blur:w*.06});
    layer(H,c=>{box(c);c.fillStyle='#c4c4c4';c.fill()},{blur:w*.25,op:'lighten'});
    layer(M,c=>{box(c);c.fillStyle=mat(.7,.15,.7);c.fill()})}
}
function kip({A,H,M},x,y,s,seed){
  const r2=mulberry(seed);
  for(let k=0;k<3;k++){const px=x+(r2()-.5)*s*.8,py=y+(r2()-.5)*s*.8,ps=s*(.38+r2()*.25),st=1.3+r2()*.5,rot=r2()*3;
    layer(A,c=>{blob(c,px,py,ps,.45,seed*3+k,st,rot);const g=c.createRadialGradient(px,py,0,px,py,ps*1.3);g.addColorStop(0,'#F1E2C4');g.addColorStop(.6,'#DDBE8C');g.addColorStop(1,'#A8743E');c.fillStyle=g;c.fill();
      c.clip();c.save();c.translate(px,py);c.rotate(rot);for(let i=0;i<10;i++){c.strokeStyle='rgba(170,120,70,.35)';c.lineWidth=ps*.04;c.beginPath();const o=(i/9-.5)*ps*1.4;c.moveTo(-ps*st,o);c.lineTo(ps*st,o+rnd(-.1,.1)*ps);c.stroke()}c.restore()},{blur:s*.01});
    layer(H,c=>{blob(c,px,py,ps,.45,seed*3+k,st,rot);c.fillStyle='#b8b8b8';c.fill()},{blur:ps*.35,op:'lighten'});
    layer(M,c=>{blob(c,px,py,ps,.45,seed*3+k,st,rot);c.fillStyle=mat(.3,.3,.4);c.fill()})}
}
function geitenkaas({A,H,M},x,y,s,seed){
  layer(A,c=>{blob(c,x,y,s*1.15,.15,seed);c.fillStyle='rgba(230,215,190,.35)';c.fill()},{blur:s*.18});
  layer(A,c=>{blob(c,x,y,s,.1,seed);c.fillStyle='#F7F4EC';c.fill();c.clip();
    for(let i=0;i<60;i++){c.fillStyle=R()<.6?'rgba(255,255,255,.4)':'rgba(200,190,170,.18)';c.beginPath();c.arc(x+rnd(-1,1)*s,y+rnd(-1,1)*s,s*rnd(.03,.08),0,7);c.fill()}
    c.filter=`blur(${s*.12}px)`;for(let i=0;i<3;i++){c.fillStyle='rgba(205,160,95,.4)';c.beginPath();c.arc(x+rnd(-.5,.5)*s,y+rnd(-.5,.5)*s,s*rnd(.12,.25),0,7);c.fill()}},{blur:s*.02});
  layer(A,c=>{blob(c,x,y,s*.97,.1,seed);c.lineWidth=s*.1;c.strokeStyle='rgba(200,192,175,.9)';c.stroke()},{blur:s*.03});
  layer(H,c=>{blob(c,x,y,s,.1,seed);const g=c.createRadialGradient(x,y,0,x,y,s);g.addColorStop(0,'#ddd');g.addColorStop(1,'#888');c.fillStyle=g;c.fill()},{blur:s*.2,op:'lighten'});
  layer(M,c=>{blob(c,x,y,s,.1,seed);c.fillStyle=mat(.25,.55,.3);c.fill()});
}
function paprika({A,H,M},x,y,s,seed){
  const cols=[['#C21E14','#E0432C','#8E140C'],['#E8A812','#F5C83A','#B07A08'],['#3C7A22','#5C9A36','#245012']][seed%3];
  const a0=rnd(0,7),span=rnd(1.2,1.9),rr=s*rnd(.9,1.2),w=s*rnd(.22,.3);
  const arc=(c,lw)=>{c.beginPath();c.arc(x,y,rr,a0,a0+span);c.lineWidth=lw;c.lineCap='round'};
  layer(A,c=>{arc(c,w);c.strokeStyle=cols[2];c.stroke();arc(c,w*.8);c.strokeStyle=cols[0];c.stroke();arc(c,w*.3);c.strokeStyle=cols[1];c.stroke()},{blur:s*.015});
  layer(A,c=>{arc(c,w);c.strokeStyle='rgba(40,15,5,.45)';c.setLineDash([s*.08,s*.35]);c.stroke()},{blur:s*.05});
  layer(H,c=>{arc(c,w);c.strokeStyle='#cfcfcf';c.stroke()},{blur:w*.35,op:'lighten'});
  layer(M,c=>{arc(c,w);c.strokeStyle=mat(.95,.15,.9);c.stroke()});
}
function jalapeno({A,H,M},x,y,s,seed){
  const ring=(c,r,lw)=>{c.beginPath();c.arc(x,y,r,0,7);c.lineWidth=lw};
  layer(A,c=>{blob(c,x,y,s,.06,seed);c.fillStyle='rgba(170,200,120,.55)';c.fill();
    ring(c,s*.86,s*.26);c.strokeStyle='#2F6A1C';c.stroke();ring(c,s*.86,s*.12);c.strokeStyle='#4E8C2C';c.stroke();
    for(let i=0;i<7;i++){const a=i/7*7+rnd(0,.4);c.fillStyle='#EDE3B5';c.beginPath();c.ellipse(x+Math.cos(a)*s*.42,y+Math.sin(a)*s*.42,s*.1,s*.065,a,0,7);c.fill()}
    c.fillStyle='rgba(235,230,200,.8)';c.beginPath();c.arc(x,y,s*.18,0,7);c.fill()},{blur:s*.02});
  layer(H,c=>{ring(c,s*.86,s*.26);c.strokeStyle='#d0d0d0';c.stroke()},{blur:s*.12,op:'lighten'});
  layer(M,c=>{blob(c,x,y,s,.06,seed);c.fillStyle=mat(.85,.2,.85);c.fill()});
}
function spinazie(L,x,y,s,rot,seed){basil(L,x,y,s,rot,seed,['#2B4A22','#1C3617','#0F220C'])}
function margherita(L){
  const {cx,cy,PR}=L;
  [[-.36,-.27,.12],[.15,-.45,.11],[.47,-.05,.1],[.3,.37,.12],[-.1,.48,.1],[-.5,.16,.1],[.04,.01,.13],[-.2,-.05,.08],[.19,.18,.09],[-.05,-.62,.07],[.42,-.38,.07],[-.4,.42,.08]]
    .forEach(([a,b,s],i)=>mozzarella(L,cx+(a+rnd(-.03,.03))*PR,cy+(b+rnd(-.03,.03))*PR,PR*s,200+i*7));
  [[-.04,-.32,.6],[.36,-.14,2.2],[.22,.3,-.7],[-.3,.26,1.4],[.54,-.42,.9],[-.55,.34,-.3]]
    .forEach(([a,b,r],i)=>basil(L,cx+a*PR,cy+b*PR,PR*rnd(.085,.11),r,700+i));
  oliveOil(L,cx,cy,PR);
}
return {render,mozzarella,salame,basil,oliveOil,blob,layer,diavola,margherita,burrata,parmigiano,gorgonzola,prosciutto,nduja,salsiccia,funghi,pomodorino,oliva,rucola,cipolla,tartufo,drizzle,flakes,ham,spek,kip,geitenkaas,paprika,jalapeno,spinazie,rnd,mulberry,mat};
})();
