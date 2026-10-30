// Live wood-fire flames (WebGL). Drawn between the oven interior and the
// stone arch; blended with `screen` so it only ever adds light.
window.ADFire = function (canvas, opts) {
  const gl = canvas.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false });
  if (!gl) return null;
  const vs = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  const fs = `precision highp float;
  uniform vec2 res;uniform float t;uniform vec2 seat;uniform float spread;uniform float heat;
  float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
  float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
  float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<6;i++){s+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return s;}
  void main(){
    vec2 uv=gl_FragCoord.xy/res; float asp=res.x/res.y;
    vec2 q=vec2((uv.x-seat.x)*asp,uv.y-seat.y)/spread;          // q.y>0 above the logs
    float acc=0.;
    for(int k=0;k<8;k++){
      float fk=float(k), off=(fk-3.5)*.15+sin(fk*7.3)*.06, ph=fk*13.7;
      vec2 c=vec2(q.x-off,q.y);
      float rise=t*(1.25+fk*.12);
      float d1=fbm(vec2(c.x*3.2+ph,c.y*2.4-rise*2.2));
      float d2=fbm(vec2(c.x*7.+ph*2.,c.y*5.-rise*3.6));
      float hgt=(.75+.4*sin(fk*3.1+t*.9))*(.75+.5*d1)*(1.-abs(fk-3.5)*.07);
      float w=(.2-.14*clamp(c.y/hgt,0.,1.))*(.8+.9*d2);
      float x=c.x+(d1-.5)*.6*clamp(c.y,0.,1.)*1.8+(d2-.5)*.08;
      float body=1.-smoothstep(0.,w,abs(x));
      float top=1.-smoothstep(hgt*.45,hgt,c.y+(d2-.5)*.25);
      float bot=smoothstep(-.05,.03,c.y);
      acc+=body*top*bot*(.4+.8*d2)*.75;
    }
    acc=clamp(acc*heat,0.,1.6);
    float base=exp(-pow(q.y+.02,2.)*60.)*exp(-q.x*q.x*4.)*.6;     // glowing bed under the flames
    float f=clamp(pow(acc,1.35),0.,1.);
    vec3 col=mix(vec3(.45,.05,0.),vec3(1.,.38,.04),smoothstep(.05,.45,f));
    col=mix(col,vec3(1.,.72,.3),smoothstep(.45,.8,f));
    col=mix(col,vec3(1.,.95,.78),smoothstep(.85,1.2,acc));
    vec3 c2=col*f+vec3(1.,.42,.08)*base;
    float glow=exp(-dot(q*vec2(1.,1.4),q*vec2(1.,1.4))*2.6)*.14*heat;  // soft bloom
    c2+=vec3(1.,.45,.12)*glow;
    gl_FragColor=vec4(c2,max(max(c2.r,c2.g),c2.b));
  }`;
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s };
  const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(pr); gl.useProgram(pr);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = n => gl.getUniformLocation(pr, n), uRes = U('res'), uT = U('t'), uSeat = U('seat'), uSpread = U('spread'), uHeat = U('heat');
  let raf = 0, t0 = performance.now(), on = false;
  const state = Object.assign({ seat: [.6, .54], spread: .22, heat: 1 }, opts);
  function frame(now) {
    const w = canvas.width, hgt = canvas.height;
    gl.viewport(0, 0, w, hgt);
    gl.uniform2f(uRes, w, hgt); gl.uniform1f(uT, (now - t0) / 1000);
    gl.uniform2f(uSeat, state.seat[0], state.seat[1]); gl.uniform1f(uSpread, state.spread); gl.uniform1f(uHeat, state.heat);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    if (on) raf = requestAnimationFrame(frame);
  }
  return {
    state,
    start() { if (!on) { on = true; raf = requestAnimationFrame(frame) } },
    stop() { on = false; cancelAnimationFrame(raf) },
    renderAt(sec) { t0 = performance.now() - sec * 1000; frame(performance.now()) },
  };
};
