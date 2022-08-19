

/* eslint-disable */

;(function(){
var UTIF = {};

// Make available for import by `require()`
if (typeof module == "object") {module.exports = UTIF;}
else {self.UTIF = UTIF;}

var pako = (typeof require === "function") ? require("pako") : self.pako;

function log() { if (typeof process=="undefined" || process.env.NODE_ENV=="development") console.log.apply(console, arguments);  }

(function(UTIF, pako){
	
// Following lines add a JPEG decoder  to UTIF.JpegDecoder
(function(){"use strict";var W=function a1(){function W(p){this.message="JPEG error: "+p}W.prototype=new Error;W.prototype.name="JpegError";W.constructor=W;return W}(),ak=function ag(){var p=new Uint8Array([0,1,8,16,9,2,3,10,17,24,32,25,18,11,4,5,12,19,26,33,40,48,41,34,27,20,13,6,7,14,21,28,35,42,49,56,57,50,43,36,29,22,15,23,30,37,44,51,58,59,52,45,38,31,39,46,53,60,61,54,47,55,62,63]),t=4017,ac=799,ah=3406,ao=2276,ar=1567,ai=3784,s=5793,ad=2896;function ak(Q){if(Q==null)Q={};if(Q.w==null)Q.w=-1;this.V=Q.n;this.N=Q.w}function a5(Q,h){var f=0,G=[],n,E,a=16,F;while(a>0&&!Q[a-1]){a--}G.push({children:[],index:0});var C=G[0];for(n=0;n<a;n++)
{for(E=0;E<Q[n];E++){C=G.pop();C.children[C.index]=h[f];while(C.index>0){C=G.pop()}C.index++;G.push(C);while(G.length<=n){G.push(F={children:[],index:0});C.children[C.index]=F.children;C=F}f++}if(n+1<a){G.push(F={children:[],index:0});C.children[C.index]=F.children;C=F}}return G[0].children}function a2(Q,h,f){return 64*((Q.P+1)*h+f)}function a7(Q,h,f,G,n,E,a,C,F,d){if(d==null)d=!1;var T=f.m,U=f.Z,z=h,J=0,V=0,r=0,D=0,a8,q=0,X,O,_,N,e,K,x=0,k,g,R,c;function Y(){if(V>0){V--;return J>>V&1}J=Q[h++];if(J===255){var I=Q[h++];if(I){if(I===220&&d){h+=2;var l=Z(Q,h);h+=2;if(l>0&&l!==f.s){throw new DNLMarkerError("Found DNL marker (0xFFDC) while parsing scan data",l)}}else if(I===217){if(d){var M=q*8;
if(M>0&&M<f.s/10){throw new DNLMarkerError("Found EOI marker (0xFFD9) while parsing scan data, "+"possibly caused by incorrect `scanLines` parameter",M)}}throw new EOIMarkerError("Found EOI marker (0xFFD9) while parsing scan data")}throw new W("unexpected marker")}}V=7;return J>>>7}function u(I){var l=I;while(!0){l=l[Y()];switch(typeof l){case"number":return l;case"object":continue}throw new W("invalid huffman sequence")}}function m(I){var e=0;while(I>0){e=e<<1|Y();I--}return e}function j(I){if(I===1){return Y()===1?1:-1}var e=m(I);if(e>=1<<I-1){return e}return e+(-1<<I)+1}function v(X,I){var l=u(X.J),M=l===0?0:j(l),N=1;
X.D[I]=X.Q+=M;while(N<64){var S=u(X.i),i=S&15,A=S>>4;if(i===0){if(A<15){break}N+=16;continue}N+=A;var o=p[N];X.D[I+o]=j(i);N++}}function $(X,I){var l=u(X.J),M=l===0?0:j(l)<<F;X.D[I]=X.Q+=M}function b(X,I){X.D[I]|=Y()<<F}function P(X,I){if(r>0){r--;return}var N=E,l=a;while(N<=l){var M=u(X.i),S=M&15,i=M>>4;if(S===0){if(i<15){r=m(i)+(1<<i)-1;break}N+=16;continue}N+=i;var A=p[N];X.D[I+A]=j(S)*(1<<F);N++}}function a4(X,I){var N=E,l=a,M=0,S,i;while(N<=l){var A=I+p[N],o=X.D[A]<0?-1:1;switch(D){case 0:i=u(X.i);S=i&15;M=i>>4;if(S===0){if(M<15){r=m(M)+(1<<M);D=4}else{M=16;D=1}}else{if(S!==1){throw new W("invalid ACn encoding")}a8=j(S);D=M?2:3}continue;case 1:case 2:if(X.D[A]){X.D[A]+=o*(Y()<<F)}else{M--;if(M===0){D=D===2?3:0}}break;case 3:if(X.D[A]){X.D[A]+=o*(Y()<<F)}else{X.D[A]=a8<<F;
D=0}break;case 4:if(X.D[A]){X.D[A]+=o*(Y()<<F)}break}N++}if(D===4){r--;if(r===0){D=0}}}function H(X,I,x,l,M){var S=x/T|0,i=x%T;q=S*X.A+l;var A=i*X.h+M,o=a2(X,q,A);I(X,o)}function w(X,I,x){q=x/X.P|0;var l=x%X.P,M=a2(X,q,l);I(X,M)}var y=G.length;if(U){if(E===0){K=C===0?$:b}else{K=C===0?P:a4}}else{K=v}if(y===1){g=G[0].P*G[0].c}else{g=T*f.R}while(x<=g){var L=n?Math.min(g-x,n):g;if(L>0){for(O=0;O<y;O++){G[O].Q=0}r=0;if(y===1){X=G[0];for(e=0;e<L;e++){w(X,K,x);x++}}else{for(e=0;e<L;
e++){for(O=0;O<y;O++){X=G[O];R=X.h;c=X.A;for(_=0;_<c;_++){for(N=0;N<R;N++){H(X,K,x,_,N)}}}x++}}}V=0;k=an(Q,h);if(!k){break}if(k.u){var a6=L>0?"unexpected":"excessive";h=k.offset}if(k.M>=65488&&k.M<=65495){h+=2}else{break}}return h-z}function al(Q,h,f){var G=Q.$,n=Q.D,E,a,C,F,d,T,U,z,J,V,Y,u,m,j,v,$,b;if(!G){throw new W("missing required Quantization Table.")}for(var r=0;r<64;r+=8){J=n[h+r];V=n[h+r+1];Y=n[h+r+2];u=n[h+r+3];m=n[h+r+4];j=n[h+r+5];v=n[h+r+6];$=n[h+r+7];J*=G[r];if((V|Y|u|m|j|v|$)===0){b=s*J+512>>10;f[r]=b;f[r+1]=b;f[r+2]=b;f[r+3]=b;f[r+4]=b;f[r+5]=b;f[r+6]=b;f[r+7]=b;continue}V*=G[r+1];Y*=G[r+2];u*=G[r+3];m*=G[r+4];j*=G[r+5];v*=G[r+6];$*=G[r+7];E=s*J+128>>8;a=s*m+128>>8;C=Y;F=v;d=ad*(V-$)+128>>8;z=ad*(V+$)+128>>8;
T=u<<4;U=j<<4;E=E+a+1>>1;a=E-a;b=C*ai+F*ar+128>>8;C=C*ar-F*ai+128>>8;F=b;d=d+U+1>>1;U=d-U;z=z+T+1>>1;T=z-T;E=E+F+1>>1;F=E-F;a=a+C+1>>1;C=a-C;b=d*ao+z*ah+2048>>12;d=d*ah-z*ao+2048>>12;z=b;b=T*ac+U*t+2048>>12;T=T*t-U*ac+2048>>12;U=b;f[r]=E+z;f[r+7]=E-z;f[r+1]=a+U;f[r+6]=a-U;f[r+2]=C+T;f[r+5]=C-T;f[r+3]=F+d;f[r+4]=F-d}for(var P=0;P<8;++P){J=f[P];V=f[P+8];Y=f[P+16];u=f[P+24];m=f[P+32];j=f[P+40];v=f[P+48];$=f[P+56];if((V|Y|u|m|j|v|$)===0){b=s*J+8192>>14;if(b<-2040){b=0}else if(b>=2024){b=255}else{b=b+2056>>4}n[h+P]=b;n[h+P+8]=b;n[h+P+16]=b;n[h+P+24]=b;n[h+P+32]=b;n[h+P+40]=b;n[h+P+48]=b;n[h+P+56]=b;continue}E=s*J+2048>>12;a=s*m+2048>>12;C=Y;F=v;d=ad*(V-$)+2048>>12;z=ad*(V+$)+2048>>12;T=u;U=j;E=(E+a+1>>1)+4112;a=E-a;b=C*ai+F*ar+2048>>12;C=C*ar-F*ai+2048>>12;F=b;d=d+U+1>>1;U=d-U;z=z+T+1>>1;T=z-T;E=E+F+1>>1;F=E-F;a=a+C+1>>1;C=a-C;b=d*ao+z*ah+2048>>12;d=d*ah-z*ao+2048>>12;z=b;
b=T*ac+U*t+2048>>12;T=T*t-U*ac+2048>>12;U=b;J=E+z;$=E-z;V=a+U;v=a-U;Y=C+T;j=C-T;u=F+d;m=F-d;if(J<16){J=0}else if(J>=4080){J=255}else{J>>=4}if(V<16){V=0}else if(V>=4080){V=255}else{V>>=4}if(Y<16){Y=0}else if(Y>=4080){Y=255}else{Y>>=4}if(u<16){u=0}else if(u>=4080){u=255}else{u>>=4}if(m<16){m=0}else if(m>=4080){m=255}else{m>>=4}if(j<16){j=0}else if(j>=4080){j=255}else{j>>=4}if(v<16){v=0}else if(v>=4080){v=255}else{v>>=4}if($<16){$=0}else if($>=4080){$=255}else{$>>=4}n[h+P]=J;
n[h+P+8]=V;n[h+P+16]=Y;n[h+P+24]=u;n[h+P+32]=m;n[h+P+40]=j;n[h+P+48]=v;n[h+P+56]=$}}function a0(Q,h){var f=h.P,G=h.c,n=new Int16Array(64);for(var E=0;E<G;E++){for(var a=0;a<f;a++){var C=a2(h,E,a);al(h,C,n)}}return h.D}function an(Q,h,f){if(f==null)f=h;var G=Q.length-1,n=f<h?f:h;if(h>=G){return null}var E=Z(Q,h);if(E>=65472&&E<=65534){return{u:null,M:E,offset:h}}var a=Z(Q,n);while(!(a>=65472&&a<=65534)){if(++n>=G){return null}a=Z(Q,n)}return{u:E.toString(16),M:a,offset:n}}ak.prototype={parse(Q,h){if(h==null)h={};
var f=h.F,E=0,a=null,C=null,F,d,T=0;function G(){var o=Z(Q,E);E+=2;var B=E+o-2,V=an(Q,B,E);if(V&&V.u){B=V.offset}var ab=Q.subarray(E,B);E+=ab.length;return ab}function n(F){var o=Math.ceil(F.o/8/F.X),B=Math.ceil(F.s/8/F.B);for(var Y=0;Y<F.W.length;Y++){R=F.W[Y];var ab=Math.ceil(Math.ceil(F.o/8)*R.h/F.X),af=Math.ceil(Math.ceil(F.s/8)*R.A/F.B),ap=o*R.h,aq=B*R.A,ae=64*aq*(ap+1);R.D=new Int16Array(ae);R.P=ab;R.c=af}F.m=o;F.R=B}var U=[],z=[],J=[],V=Z(Q,E);E+=2;if(V!==65496){throw new W("SOI not found")}V=Z(Q,E);
E+=2;markerLoop:while(V!==65497){var Y,u,m;switch(V){case 65504:case 65505:case 65506:case 65507:case 65508:case 65509:case 65510:case 65511:case 65512:case 65513:case 65514:case 65515:case 65516:case 65517:case 65518:case 65519:case 65534:var j=G();if(V===65504){if(j[0]===74&&j[1]===70&&j[2]===73&&j[3]===70&&j[4]===0){a={version:{d:j[5],T:j[6]},K:j[7],j:j[8]<<8|j[9],H:j[10]<<8|j[11],S:j[12],I:j[13],C:j.subarray(14,14+3*j[12]*j[13])}}}if(V===65518){if(j[0]===65&&j[1]===100&&j[2]===111&&j[3]===98&&j[4]===101){C={version:j[5]<<8|j[6],k:j[7]<<8|j[8],q:j[9]<<8|j[10],a:j[11]}}}break;
case 65499:var v=Z(Q,E),b;E+=2;var $=v+E-2;while(E<$){var r=Q[E++],P=new Uint16Array(64);if(r>>4===0){for(u=0;u<64;u++){b=p[u];P[b]=Q[E++]}}else if(r>>4===1){for(u=0;u<64;u++){b=p[u];P[b]=Z(Q,E);E+=2}}else{throw new W("DQT - invalid table spec")}U[r&15]=P}break;case 65472:case 65473:case 65474:if(F){throw new W("Only single frame JPEGs supported")}E+=2;F={};F.G=V===65473;F.Z=V===65474;F.precision=Q[E++];var D=Z(Q,E),a4,q=0,H=0;E+=2;F.s=f||D;F.o=Z(Q,E);E+=2;F.W=[];F._={};var a8=Q[E++];for(Y=0;Y<a8;Y++){a4=Q[E];var w=Q[E+1]>>4,y=Q[E+1]&15;if(q<w){q=w}if(H<y){H=y}var X=Q[E+2];m=F.W.push({h:w,A:y,L:X,$:null});F._[a4]=m-1;E+=3}F.X=q;F.B=H;n(F);break;case 65476:var O=Z(Q,E);E+=2;
for(Y=2;Y<O;){var _=Q[E++],N=new Uint8Array(16),e=0;for(u=0;u<16;u++,E++){e+=N[u]=Q[E]}var K=new Uint8Array(e);for(u=0;u<e;u++,E++){K[u]=Q[E]}Y+=17+e;(_>>4===0?J:z)[_&15]=a5(N,K)}break;case 65501:E+=2;d=Z(Q,E);E+=2;break;case 65498:var x=++T===1&&!f,R;E+=2;var k=Q[E++],g=[];for(Y=0;Y<k;Y++){var c=Q[E++],L=F._[c];R=F.W[L];R.index=c;var a6=Q[E++];R.J=J[a6>>4];R.i=z[a6&15];g.push(R)}var I=Q[E++],l=Q[E++],M=Q[E++];try{var S=a7(Q,E,F,g,d,I,l,M>>4,M&15,x);E+=S}catch(ex){if(ex instanceof DNLMarkerError){return this.parse(Q,{F:ex.s})}else if(ex instanceof EOIMarkerError){break markerLoop}throw ex}break;case 65500:E+=4;break;case 65535:if(Q[E]!==255){E--}break;default:var i=an(Q,E-2,E-3);if(i&&i.u){E=i.offset;break}if(E>=Q.length-1){break markerLoop}throw new W("JpegImage.parse - unknown marker: "+V.toString(16))}V=Z(Q,E);E+=2}this.width=F.o;this.height=F.s;this.g=a;this.b=C;this.W=[];for(Y=0;Y<F.W.length;Y++){R=F.W[Y];
var A=U[R.L];if(A){R.$=A}this.W.push({index:R.index,e:a0(F,R),l:R.h/F.X,t:R.A/F.B,P:R.P,c:R.c})}this.p=this.W.length;return undefined},Y(Q,h,f){if(f==null)f=!1;var G=this.width/Q,n=this.height/h,E,a,C,F,d,T,U,z,J,V,Y=0,u,m=this.W.length,j=Q*h*m,v=new Uint8ClampedArray(j),$=new Uint32Array(Q),b=4294967288,r;for(U=0;U<m;U++){E=this.W[U];a=E.l*G;C=E.t*n;Y=U;u=E.e;F=E.P+1<<3;if(a!==r){for(d=0;d<Q;d++){z=0|d*a;$[d]=(z&b)<<3|z&7}r=a}for(T=0;T<h;T++){z=0|T*C;V=F*(z&b)|(z&7)<<3;for(d=0;d<Q;d++){v[Y]=u[V+$[d]];Y+=m}}}var P=this.V;if(!f&&m===4&&!P){P=new Int32Array([-256,255,-256,255,-256,255,-256,255])}if(P){for(U=0;U<j;){for(z=0,J=0;z<m;z++,U++,J+=2){v[U]=(v[U]*P[J]>>8)+P[J+1]}}}return v},get f(){if(this.b){return!!this.b.a}if(this.p===3){if(this.N===0){return!1}else if(this.W[0].index===82&&this.W[1].index===71&&this.W[2].index===66){return!1}return!0}if(this.N===1){return!0}return!1},z:function aj(Q){var h,f,G;
for(var n=0,E=Q.length;n<E;n+=3){h=Q[n];f=Q[n+1];G=Q[n+2];Q[n]=h-179.456+1.402*G;Q[n+1]=h+135.459-.344*f-.714*G;Q[n+2]=h-226.816+1.772*f}return Q},O:function aa(Q){var h,f,G,n,E=0;for(var a=0,C=Q.length;a<C;a+=4){h=Q[a];f=Q[a+1];G=Q[a+2];n=Q[a+3];Q[E++]=-122.67195406894+f*(-660635669420364e-19*f+.000437130475926232*G-54080610064599e-18*h+.00048449797120281*n-.154362151871126)+G*(-.000957964378445773*G+.000817076911346625*h-.00477271405408747*n+1.53380253221734)+h*(.000961250184130688*h-.00266257332283933*n+.48357088451265)+n*(-.000336197177618394*n+.484791561490776);
Q[E++]=107.268039397724+f*(219927104525741e-19*f-.000640992018297945*G+.000659397001245577*h+.000426105652938837*n-.176491792462875)+G*(-.000778269941513683*G+.00130872261408275*h+.000770482631801132*n-.151051492775562)+h*(.00126935368114843*h-.00265090189010898*n+.25802910206845)+n*(-.000318913117588328*n-.213742400323665);Q[E++]=-20.810012546947+f*(-.000570115196973677*f-263409051004589e-19*G+.0020741088115012*h-.00288260236853442*n+.814272968359295)+G*(-153496057440975e-19*G-.000132689043961446*h+.000560833691242812*n-.195152027534049)+h*(.00174418132927582*h-.00255243321439347*n+.116935020465145)+n*(-.000343531996510555*n+.24165260232407)}return Q.subarray(0,E)},r:function a3(Q){var h,f,G;
for(var n=0,E=Q.length;n<E;n+=4){h=Q[n];f=Q[n+1];G=Q[n+2];Q[n]=434.456-h-1.402*G;Q[n+1]=119.541-h+.344*f+.714*G;Q[n+2]=481.816-h-1.772*f}return Q},U:function as(Q){var h,f,G,n,E=0;for(var a=0,C=Q.length;a<C;a+=4){h=Q[a];f=Q[a+1];G=Q[a+2];n=Q[a+3];Q[E++]=255+h*(-6747147073602441e-20*h+.0008379262121013727*f+.0002894718188643294*G+.003264231057537806*n-1.1185611867203937)+f*(26374107616089404e-21*f-8626949158638572e-20*G-.0002748769067499491*n-.02155688794978967)+G*(-3878099212869363e-20*G-.0003267808279485286*n+.0686742238595345)-n*(.0003361971776183937*n+.7430659151342254);
Q[E++]=255+h*(.00013596372813588848*h+.000924537132573585*f+.00010567359618683593*G+.0004791864687436512*n-.3109689587515875)+f*(-.00023545346108370344*f+.0002702845253534714*G+.0020200308977307156*n-.7488052167015494)+G*(6834815998235662e-20*G+.00015168452363460973*n-.09751927774728933)-n*(.0003189131175883281*n+.7364883807733168);Q[E++]=255+h*(13598650411385308e-21*h+.00012423956175490851*f+.0004751985097583589*G-36729317476630424e-22*n-.05562186980264034)+f*(.00016141380598724676*f+.0009692239130725186*G+.0007782692450036253*n-.44015232367526463)+G*(5.068882914068769e-7*G+.0017778369011375071*n-.7591454649749609)-n*(.0003435319965105553*n+.7063770186160144)}return Q.subarray(0,E)},getData:function(Q){var h=Q.width,f=Q.height,G=Q.forceRGB,n=Q.isSourcePDF;
if(this.p>4){throw new W("Unsupported color mode")}var E=this.Y(h,f,n);if(this.p===1&&G){var a=E.length,C=new Uint8ClampedArray(a*3),F=0;for(var d=0;d<a;d++){var T=E[d];C[F++]=T;C[F++]=T;C[F++]=T}return C}else if(this.p===3&&this.f){return this.z(E)}else if(this.p===4){if(this.f){if(G){return this.O(E)}return this.r(E)}else if(G){return this.U(E)}}return E}};return ak}();function a9(p,t){return p[t]<<24>>24}function Z(p,t){return p[t]<<8|p[t+1]}function am(p,t){return(p[t]<<24|p[t+1]<<16|p[t+2]<<8|p[t+3])>>>0}UTIF.JpegDecoder=ak}());

//UTIF.JpegDecoder = PDFJS.JpegImage;


UTIF.encodeImage = function(rgba, w, h, metadata)
{
	var idf = { "t256":[w], "t257":[h], "t258":[8,8,8,8], "t259":[1], "t262":[2], "t273":[1000], // strips offset
				"t277":[4], "t278":[h], /* rows per strip */          "t279":[w*h*4], // strip byte counts
				"t282":[[72,1]], "t283":[[72,1]], "t284":[1], "t286":[[0,1]], "t287":[[0,1]], "t296":[1], "t305": ["Photopea (UTIF.js)"], "t338":[1]
		};
	if (metadata) for (var i in metadata) idf[i] = metadata[i];
	
	var prfx = new Uint8Array(UTIF.encode([idf]));
	var img = new Uint8Array(rgba);
	var data = new Uint8Array(1000+w*h*4);
	for(var i=0; i<prfx.length; i++) data[i] = prfx[i];
	for(var i=0; i<img .length; i++) data[1000+i] = img[i];
	return data.buffer;
}

UTIF.encode = function(ifds)
{
	var LE = false;
	var data = new Uint8Array(20000), offset = 4, bin = LE ? UTIF._binLE : UTIF._binBE;
	data[0]=data[1]=LE?73:77;  bin.writeUshort(data,2,42);

	var ifdo = 8;
	bin.writeUint(data, offset, ifdo);  offset+=4;
	for(var i=0; i<ifds.length; i++)
	{
		var noffs = UTIF._writeIFD(bin, UTIF._types.basic, data, ifdo, ifds[i]);
		ifdo = noffs[1];
		if(i<ifds.length-1) {
			if((ifdo&3)!=0) ifdo+=(4-(ifdo&3));  // make each IFD start at multiple of 4
			bin.writeUint(data, noffs[0], ifdo);
		}
	}
	return data.slice(0, ifdo).buffer;
}

UTIF.decode = function(buff, prm)
{
	if(prm==null) prm = {parseMN:true, debug:false};  // read MakerNote, debug
	var data = new Uint8Array(buff), offset = 0;

	var id = UTIF._binBE.readASCII(data, offset, 2);  offset+=2;
	var bin = id=="II" ? UTIF._binLE : UTIF._binBE;
	var num = bin.readUshort(data, offset);  offset+=2;

	var ifdo = bin.readUint(data, offset);  offset+=4;
	var ifds = [];
	while(true) {
		var cnt = bin.readUshort(data,ifdo), typ = bin.readUshort(data,ifdo+4);  if(cnt!=0) if(typ<1 || 13<typ) {  log("error in TIFF");  break  };
		UTIF._readIFD(bin, data, ifdo, ifds, 0, prm);
		
		ifdo = bin.readUint(data, ifdo+2+cnt*12);
		if(ifdo==0) break;
	}
	return ifds;
}

UTIF.decodeImage = function(buff, img, ifds)
{
	if(img.data) return;
	var data = new Uint8Array(buff);
	var id = UTIF._binBE.readASCII(data, 0, 2);

	if(img["t256"]==null) return;	// No width => probably not an image
	img.isLE = id=="II";
	img.width  = img["t256"][0];  //delete img["t256"];
	img.height = img["t257"][0];  //delete img["t257"];

	var cmpr   = img["t259"] ? img["t259"][0] : 1;  //delete img["t259"];
	var fo = img["t266"] ? img["t266"][0] : 1;  //delete img["t266"];
	if(img["t284"] && img["t284"][0]==2) log("PlanarConfiguration 2 should not be used!");

	var bipp;  // bits per pixel
	if(img["t258"]) bipp = Math.min(32,img["t258"][0])*img["t258"].length;
	else            bipp = (img["t277"]?img["t277"][0]:1);  
	// Some .NEF files have t258==14, even though they use 16 bits per pixel
	if(cmpr==1 && img["t279"]!=null && img["t278"] && img["t262"][0]==32803)  {
		bipp = Math.round((img["t279"][0]*8)/(img.width*img["t278"][0]));
	}
	var bipl = Math.ceil(img.width*bipp/8)*8;
	var soff = img["t273"];  if(soff==null) soff = img["t324"];
	var bcnt = img["t279"];  if(cmpr==1 && soff.length==1) bcnt = [img.height*(bipl>>>3)];  if(bcnt==null) bcnt = img["t325"];
	//bcnt[0] = Math.min(bcnt[0], data.length);  // Hasselblad, "RAW_HASSELBLAD_H3D39II.3FR"
	var bytes = new Uint8Array(img.height*(bipl>>>3)), bilen = 0;

	if(img["t322"]!=null) // tiled
	{
		var tw = img["t322"][0], th = img["t323"][0];
		var tx = Math.floor((img.width  + tw - 1) / tw);
		var ty = Math.floor((img.height + th - 1) / th);
		var tbuff = new Uint8Array(Math.ceil(tw*th*bipp/8)|0);
		for(var y=0; y<ty; y++)
			for(var x=0; x<tx; x++)
			{
				var i = y*tx+x;  for(var j=0; j<tbuff.length; j++) tbuff[j]=0;
				UTIF.decode._decompress(img,ifds, data, soff[i], bcnt[i], cmpr, tbuff, 0, fo);
				// Might be required for 7 too. Need to check
				if (cmpr==6) bytes = tbuff;
				else UTIF._copyTile(tbuff, Math.ceil(tw*bipp/8)|0, th, bytes, Math.ceil(img.width*bipp/8)|0, img.height, Math.ceil(x*tw*bipp/8)|0, y*th);
			}
		bilen = bytes.length*8;
	}
	else	// stripped
	{
		var rps = img["t278"] ? img["t278"][0] : img.height;   rps = Math.min(rps, img.height);
		for(var i=0; i<soff.length; i++)
		{
			UTIF.decode._decompress(img,ifds, data, soff[i], bcnt[i], cmpr, bytes, Math.ceil(bilen/8)|0, fo);
			bilen += bipl * rps;
		}
		bilen = Math.min(bilen, bytes.length*8);
	}
	img.data = new Uint8Array(bytes.buffer, 0, Math.ceil(bilen/8)|0);
}

UTIF.decode._decompress = function(img,ifds, data, off, len, cmpr, tgt, toff, fo)  // fill order
{
	//console.log("compression", cmpr);
	//var time = Date.now();
	if(false) {}
	else if(cmpr==1/* || (len==tgt.length && cmpr!=32767)*/) for(var j=0; j<len; j++) tgt[toff+j] = data[off+j];
	else if(cmpr==3) UTIF.decode._decodeG3 (data, off, len, tgt, toff, img.width, fo, img["t292"]?((img["t292"][0]&1)==1):false);
	else if(cmpr==4) UTIF.decode._decodeG4 (data, off, len, tgt, toff, img.width, fo);
	else if(cmpr==5) UTIF.decode._decodeLZW(data, off, len, tgt, toff,8);
	else if(cmpr==6) UTIF.decode._decodeOldJPEG(img, data, off, len, tgt, toff);
	else if(cmpr==7 || cmpr==34892) UTIF.decode._decodeNewJPEG(img, data, off, len, tgt, toff);
	else if(cmpr==8 || cmpr==32946) {  var src = new Uint8Array(data.buffer,off,len);  var bin = pako["inflate"](src);  for(var i=0; i<bin.length; i++) tgt[toff+i]=bin[i];  }
	else if(cmpr==9) UTIF.decode._decodeVC5(data,off,len,tgt,toff);
	else if(cmpr==32767) UTIF.decode._decodeARW(img, data, off, len, tgt, toff);
	else if(cmpr==32773) UTIF.decode._decodePackBits(data, off, len, tgt, toff);
	else if(cmpr==32809) UTIF.decode._decodeThunder (data, off, len, tgt, toff);
	else if(cmpr==34713) //for(var j=0; j<len; j++) tgt[toff+j] = data[off+j];
		UTIF.decode._decodeNikon   (img,ifds, data, off, len, tgt, toff);
	else log("Unknown compression", cmpr);
	
	//console.log(Date.now()-time);
	
	var bps = (img["t258"]?Math.min(32,img["t258"][0]):1);
	var noc = (img["t277"]?img["t277"][0]:1), bpp=(bps*noc)>>>3, h = (img["t278"] ? img["t278"][0] : img.height), bpl = Math.ceil(bps*noc*img.width/8);
	
	// convert to Little Endian  /*
	if(bps==16 && !img.isLE && img["t33422"]==null)  // not DNG
		for(var y=0; y<h; y++) {
			//console.log("fixing endianity");
			var roff = toff+y*bpl;
			for(var x=1; x<bpl; x+=2) {  var t=tgt[roff+x];  tgt[roff+x]=tgt[roff+x-1];  tgt[roff+x-1]=t;  }
		}  //*/

	if(img["t317"] && img["t317"][0]==2)
	{
		for(var y=0; y<h; y++)
		{
			var ntoff = toff+y*bpl;
			if(bps==16) for(var j=bpp; j<bpl; j+=2) {
				var nv = ((tgt[ntoff+j+1]<<8)|tgt[ntoff+j])  +  ((tgt[ntoff+j-bpp+1]<<8)|tgt[ntoff+j-bpp]);
				tgt[ntoff+j] = nv&255;  tgt[ntoff+j+1] = (nv>>>8)&255;  
			}
			else if(noc==3) for(var j=  3; j<bpl; j+=3)
			{
				tgt[ntoff+j  ] = (tgt[ntoff+j  ] + tgt[ntoff+j-3])&255;
				tgt[ntoff+j+1] = (tgt[ntoff+j+1] + tgt[ntoff+j-2])&255;
				tgt[ntoff+j+2] = (tgt[ntoff+j+2] + tgt[ntoff+j-1])&255;
			}
			else for(var j=bpp; j<bpl; j++) tgt[ntoff+j] = (tgt[ntoff+j] + tgt[ntoff+j-bpp])&255;
		}
	}
}

UTIF.decode._decodeVC5 = UTIF.decode._decodeVC5=function(){var e=[1,0,1,0,2,2,1,1,3,7,1,2,5,25,1,3,6,48,1,4,6,54,1,5,7,111,1,8,7,99,1,6,7,105,12,0,7,107,1,7,8,209,20,0,8,212,1,9,8,220,1,10,9,393,1,11,9,394,32,0,9,416,1,12,9,427,1,13,10,887,1,18,10,784,1,14,10,790,1,15,10,835,60,0,10,852,1,16,10,885,1,17,11,1571,1,19,11,1668,1,20,11,1669,100,0,11,1707,1,21,11,1772,1,22,12,3547,1,29,12,3164,1,24,12,3166,1,25,12,3140,1,23,12,3413,1,26,12,3537,1,27,12,3539,1,28,13,7093,1,35,13,6283,1,30,13,6331,1,31,13,6335,180,0,13,6824,1,32,13,7072,1,33,13,7077,320,0,13,7076,1,34,14,12565,1,36,14,12661,1,37,14,12669,1,38,14,13651,1,39,14,14184,1,40,15,28295,1,46,15,28371,1,47,15,25320,1,42,15,25336,1,43,15,25128,1,41,15,27300,1,44,15,28293,1,45,16,50259,1,48,16,50643,1,49,16,50675,1,50,16,56740,1,53,16,56584,1,51,16,56588,1,52,17,113483,1,61,17,113482,1,60,17,101285,1,55,17,101349,1,56,17,109205,1,57,17,109207,1,58,17,100516,1,54,17,113171,1,59,18,202568,1,62,18,202696,1,63,18,218408,1,64,18,218412,1,65,18,226340,1,66,18,226356,1,67,18,226358,1,68,19,402068,1,69,19,405138,1,70,19,405394,1,71,19,436818,1,72,19,436826,1,73,19,452714,1,75,19,452718,1,76,19,452682,1,74,20,804138,1,77,20,810279,1,78,20,810790,1,79,20,873638,1,80,20,873654,1,81,20,905366,1,82,20,905430,1,83,20,905438,1,84,21,1608278,1,85,21,1620557,1,86,21,1621582,1,87,21,1621583,1,88,21,1747310,1,89,21,1810734,1,90,21,1810735,1,91,21,1810863,1,92,21,1810879,1,93,22,3621725,1,99,22,3621757,1,100,22,3241112,1,94,22,3494556,1,95,22,3494557,1,96,22,3494622,1,97,22,3494623,1,98,23,6482227,1,102,23,6433117,1,101,23,6989117,1,103,23,6989119,1,105,23,6989118,1,104,23,7243449,1,106,23,7243512,1,107,24,13978233,1,111,24,12964453,1,109,24,12866232,1,108,24,14486897,1,113,24,13978232,1,110,24,14486896,1,112,24,14487026,1,114,24,14487027,1,115,25,25732598,1,225,25,25732597,1,189,25,25732596,1,188,25,25732595,1,203,25,25732594,1,202,25,25732593,1,197,25,25732592,1,207,25,25732591,1,169,25,25732590,1,223,25,25732589,1,159,25,25732522,1,235,25,25732579,1,152,25,25732575,1,192,25,25732489,1,179,25,25732573,1,201,25,25732472,1,172,25,25732576,1,149,25,25732488,1,178,25,25732566,1,120,25,25732571,1,219,25,25732577,1,150,25,25732487,1,127,25,25732506,1,211,25,25732548,1,125,25,25732588,1,158,25,25732486,1,247,25,25732467,1,238,25,25732508,1,163,25,25732552,1,228,25,25732603,1,183,25,25732513,1,217,25,25732587,1,168,25,25732520,1,122,25,25732484,1,128,25,25732562,1,249,25,25732505,1,187,25,25732504,1,186,25,25732483,1,136,25,25928905,1,181,25,25732560,1,255,25,25732500,1,230,25,25732482,1,135,25,25732555,1,233,25,25732568,1,222,25,25732583,1,145,25,25732481,1,134,25,25732586,1,167,25,25732521,1,248,25,25732518,1,209,25,25732480,1,243,25,25732512,1,216,25,25732509,1,164,25,25732547,1,140,25,25732479,1,157,25,25732544,1,239,25,25732574,1,191,25,25732564,1,251,25,25732478,1,156,25,25732546,1,139,25,25732498,1,242,25,25732557,1,133,25,25732477,1,162,25,25732515,1,213,25,25732584,1,165,25,25732514,1,212,25,25732476,1,227,25,25732494,1,198,25,25732531,1,236,25,25732530,1,234,25,25732529,1,117,25,25732528,1,215,25,25732527,1,124,25,25732526,1,123,25,25732525,1,254,25,25732524,1,253,25,25732523,1,148,25,25732570,1,218,25,25732580,1,146,25,25732581,1,147,25,25732569,1,224,25,25732533,1,143,25,25732540,1,184,25,25732541,1,185,25,25732585,1,166,25,25732556,1,132,25,25732485,1,129,25,25732563,1,250,25,25732578,1,151,25,25732501,1,119,25,25732502,1,193,25,25732536,1,176,25,25732496,1,245,25,25732553,1,229,25,25732516,1,206,25,25732582,1,144,25,25732517,1,208,25,25732558,1,137,25,25732543,1,241,25,25732466,1,237,25,25732507,1,190,25,25732542,1,240,25,25732551,1,131,25,25732554,1,232,25,25732565,1,252,25,25732475,1,171,25,25732493,1,205,25,25732492,1,204,25,25732491,1,118,25,25732490,1,214,25,25928904,1,180,25,25732549,1,126,25,25732602,1,182,25,25732539,1,175,25,25732545,1,141,25,25732559,1,138,25,25732537,1,177,25,25732534,1,153,25,25732503,1,194,25,25732606,1,160,25,25732567,1,121,25,25732538,1,174,25,25732497,1,246,25,25732550,1,130,25,25732572,1,200,25,25732474,1,170,25,25732511,1,221,25,25732601,1,196,25,25732532,1,142,25,25732519,1,210,25,25732495,1,199,25,25732605,1,155,25,25732535,1,154,25,25732499,1,244,25,25732510,1,220,25,25732600,1,195,25,25732607,1,161,25,25732604,1,231,25,25732473,1,173,25,25732599,1,226,26,51465122,1,116,26,51465123,0,1],x,u,H,d=[3,3,3,3,2,2,2,1,1,1],a=24576,a7=16384,K=8192,ai=a7|K;
function A(B){var P=B[1],D=B[0][P>>>3]>>>7-(P&7)&1;B[1]++;return D}function aj(B,P){if(x==null){x={};
for(var D=0;D<e.length;D+=4)x[e[D+1]]=e.slice(D,D+4)}var U=A(B),X=x[U];while(X==null){U=U<<1|A(B);X=x[U]}var y=X[3];
if(y!=0)y=A(B)==0?y:-y;P[0]=X[2];P[1]=y}function Q(B,P){for(var D=0;D<P;D++){if((B&1)==1)B++;B=B>>>1}return B}function c(B,P){return B>>P}function N(B,P,D,U,X,y){P[D]=c(c(11*B[X]-4*B[X+y]+B[X+y+y]+4,3)+B[U],1);
P[D+y]=c(c(5*B[X]+4*B[X+y]-B[X+y+y]+4,3)-B[U],1)}function g(B,P,D,U,X,y){var n=B[X-y]-B[X+y],S=B[X],O=B[U];
P[D]=c(c(n+4,3)+S+O,1);P[D+y]=c(c(-n+4,3)+S-O,1)}function L(B,P,D,U,X,y){P[D]=c(c(5*B[X]+4*B[X-y]-B[X-y-y]+4,3)+B[U],1);
P[D+y]=c(c(11*B[X]-4*B[X-y]+B[X-y-y]+4,3)-B[U],1)}function t(B){B=B<0?0:B>4095?4095:B;B=H[B]>>>2;return B}function ab(B,P,D,U,X){U=new Uint16Array(U.buffer);
var y=Date.now(),n=UTIF._binBE,S=P+D,O,q,i,M,m,aA,T,a8,a0,am,au,a3,aw,ao,v,ax,p,k;P+=4;while(P<S){var W=n.readShort(B,P),E=n.readUshort(B,P+2);
P+=4;if(W==12)O=E;else if(W==20)q=E;else if(W==21)i=E;else if(W==48)M=E;else if(W==53)m=E;else if(W==35)aA=E;
else if(W==62)T=E;else if(W==101)a8=E;else if(W==109)a0=E;else if(W==84)am=E;else if(W==106)au=E;else if(W==107)a3=E;
else if(W==108)aw=E;else if(W==102)ao=E;else if(W==104)v=E;else if(W==105)ax=E;else{var C=W<0?-W:W,F=C&65280,o=0;
if(C&ai){if(C&K){o=E&65535;o+=(C&255)<<16}else{o=E&65535}}if((C&a)==a){if(p==null){p=[];for(var f=0;
f<4;f++)p[f]=new Int16Array((q>>>1)*(i>>>1));k=new Int16Array((q>>>1)*(i>>>1));u=new Int16Array(1024);
for(var f=0;f<1024;f++){var aF=f-512,j=Math.abs(aF),O=Math.floor(768*j*j*j/(255*255*255))+j;u[f]=Math.sign(aF)*O}H=new Uint16Array(4096);
var al=(1<<16)-1;for(var f=0;f<4096;f++){var ad=f,az=al*(Math.pow(113,ad/4095)-1)/112;H[f]=Math.min(az,al)}}var Z=p[T],V=Q(q,1+d[M]),z=Q(i,1+d[M]);
if(M==0){for(var b=0;b<z;b++)for(var G=0;G<V;G++){var w=P+(b*V+G)*2;Z[b*(q>>>1)+G]=B[w]<<8|B[w+1]}}else{var aC=[B,P*8],aq=[],a5=0,ae=V*z,I=[0,0],s=0,E=0;
while(a5<ae){aj(aC,I);s=I[0];E=I[1];while(s>0){aq[a5++]=E;s--}}var $=(M-1)%3,aE=$!=1?V:0,as=$!=0?z:0;
for(var b=0;b<z;b++){var ay=(b+as)*(q>>>1)+aE,aa=b*V;for(var G=0;G<V;G++)Z[ay+G]=u[aq[aa+G]+512]*m}if($==2){var v=q>>>1,an=V*2,at=z*2;
for(var b=0;b<z;b++){for(var G=0;G<an;G++){var f=b*2*v+G,_=b*v+G,l=z*v+_;if(b==0)N(Z,k,f,l,_,v);else if(b==z-1)L(Z,k,f,l,_,v);
else g(Z,k,f,l,_,v)}}var h=Z;Z=k;k=h;for(var b=0;b<at;b++){for(var G=0;G<V;G++){var f=b*v+2*G,_=b*v+G,l=V+_;
if(G==0)N(Z,k,f,l,_,1);else if(G==V-1)L(Z,k,f,l,_,1);else g(Z,k,f,l,_,1)}}var h=Z;Z=k;k=h;var a6=[],aD=2-~~((M-1)/3);
for(var r=0;r<3;r++)a6[r]=a0>>14-r*2&3;var af=a6[aD];if(af!=0)for(var b=0;b<at;b++)for(var G=0;G<an;
G++){var f=b*v+G;Z[f]=Z[f]<<af}}}if(M==9&&T==3){var a2=p[0],ar=p[1],ah=p[2],a1=p[3];for(var b=0;b<i;
b+=2)for(var G=0;G<q;G+=2){var J=b*q+G,w=(b>>>1)*(q>>>1)+(G>>>1),R=a2[w],ak=ar[w]-2048,aB=ah[w]-2048,av=a1[w]-2048,a4=(ak<<1)+R,a9=(aB<<1)+R,ap=R+av,ag=R-av;
U[J]=t(a4);U[J+1]=t(ap);U[J+q]=t(ag);U[J+q+1]=t(a9)}}P+=o*4}else if(C==16388){P+=o*4}else if(F==8192||F==8448||F==9216){}else throw C.toString(16)}}console.log(Date.now()-y)}return ab}()

UTIF.decode._ljpeg_diff = function(data, prm, huff) {
	var getbithuff   = UTIF.decode._getbithuff;
	var len, diff;
	len  = getbithuff(data, prm, huff[0], huff);
	diff = getbithuff(data, prm, len, 0);
	if ((diff & (1 << (len-1))) == 0)  diff -= (1 << len) - 1;
	return diff;
}
UTIF.decode._decodeARW = function(img, inp, off, src_length, tgt, toff) {
	var raw_width = img["t256"][0], height=img["t257"][0], tiff_bps=img["t258"][0];
	var bin=(img.isLE ? UTIF._binLE : UTIF._binBE);
	//console.log(raw_width, height, tiff_bps, raw_width*height, src_length);
	var arw2 = (raw_width*height == src_length) || (raw_width*height*1.5 == src_length);
	//arw2 = true;
	//console.log("ARW2: ", arw2, raw_width*height, src_length, tgt.length);
	if(!arw2) {  //"sony_arw_load_raw"; // not arw2
		height+=8;
		var prm = [off,0,0,0];
		var huff = new Uint16Array(32770);
		var tab = [ 0xf11,0xf10,0xe0f,0xd0e,0xc0d,0xb0c,0xa0b,0x90a,0x809,
			0x708,0x607,0x506,0x405,0x304,0x303,0x300,0x202,0x201 ];
		var i, c, n, col, row, sum=0;
		var ljpeg_diff = UTIF.decode._ljpeg_diff;

		huff[0] = 15;
		for (n=i=0; i < 18; i++) {
			var lim = 32768 >>> (tab[i] >>> 8);
			for(var c=0; c<lim; c++) huff[++n] = tab[i];
		}
		for (col = raw_width; col--; )
			for (row=0; row < height+1; row+=2) {
				if (row == height) row = 1;
				sum += ljpeg_diff(inp, prm, huff);
				if (row < height) {
					var clr =  (sum)&4095;
					UTIF.decode._putsF(tgt, (row*raw_width+col)*tiff_bps, clr<<(16-tiff_bps));
				}
			}
		return;
	}
	if(raw_width*height*1.5==src_length) {
		//console.log("weird compression");
		for(var i=0; i<src_length; i+=3) {  var b0=inp[off+i+0], b1=inp[off+i+1], b2=inp[off+i+2];  
			tgt[toff+i]=(b1<<4)|(b0>>>4);  tgt[toff+i+1]=(b0<<4)|(b2>>>4);  tgt[toff+i+2]=(b2<<4)|(b1>>>4);  }
		return;
	}
	
	var pix = new Uint16Array(16);
	var row, col, val, max, min, imax, imin, sh, bit, i,    dp;
	
	var data = new Uint8Array(raw_width+1);
	for (row=0; row < height; row++) {
		//fread (data, 1, raw_width, ifp);
		for(var j=0; j<raw_width; j++) data[j]=inp[off++];
		for (dp=0, col=0; col < raw_width-30; dp+=16) {
			max  = 0x7ff & (val = bin.readUint(data,dp));
			min  = 0x7ff & (val >>> 11);
			imax = 0x0f & (val >>> 22);
			imin = 0x0f & (val >>> 26);
			for (sh=0; sh < 4 && 0x80 << sh <= max-min; sh++);
			for (bit=30, i=0; i < 16; i++)
				if      (i == imax) pix[i] = max;
				else if (i == imin) pix[i] = min;
				else {
					pix[i] = ((bin.readUshort(data, dp+(bit >> 3)) >>> (bit & 7) & 0x7f) << sh) + min;
					if (pix[i] > 0x7ff) pix[i] = 0x7ff;
					bit += 7;
				}
			for (i=0; i < 16; i++, col+=2) {
				//RAW(row,col) = curve[pix[i] << 1] >> 2;
				var clr =  pix[i]<<1;   //clr = 0xffff;
				UTIF.decode._putsF(tgt, (row*raw_width+col)*tiff_bps, clr<<(16-tiff_bps));
			}
			col -= col & 1 ? 1:31;
		}
	}
}

UTIF.decode._decodeNikon = function(img,imgs, data, off, src_length, tgt, toff)
{
	var nikon_tree = [
    [ 0, 0,1,5,1,1,1,1,1,1,2,0,0,0,0,0,0,	/* 12-bit lossy */
      5,4,3,6,2,7,1,0,8,9,11,10,12 ],
    [ 0, 0,1,5,1,1,1,1,1,1,2,0,0,0,0,0,0,	/* 12-bit lossy after split */
      0x39,0x5a,0x38,0x27,0x16,5,4,3,2,1,0,11,12,12 ],
    [ 0, 0,1,4,2,3,1,2,0,0,0,0,0,0,0,0,0,  /* 12-bit lossless */
      5,4,6,3,7,2,8,1,9,0,10,11,12 ],
    [ 0, 0,1,4,3,1,1,1,1,1,2,0,0,0,0,0,0,	/* 14-bit lossy */
      5,6,4,7,8,3,9,2,1,0,10,11,12,13,14 ],
    [ 0, 0,1,5,1,1,1,1,1,1,1,2,0,0,0,0,0,	/* 14-bit lossy after split */
      8,0x5c,0x4b,0x3a,0x29,7,6,5,4,3,2,1,0,13,14 ],
    [ 0, 0,1,4,2,2,3,1,2,0,0,0,0,0,0,0,0,	/* 14-bit lossless */
      7,6,8,5,9,4,10,3,11,12,2,0,1,13,14 ] ];
	  
	var raw_width = img["t256"][0], height=img["t257"][0], tiff_bps=img["t258"][0];
	
	var tree = 0, split = 0;
	var make_decoder = UTIF.decode._make_decoder;
	var getbithuff   = UTIF.decode._getbithuff;
	
	var mn = imgs[0].exifIFD.makerNote, md = mn["t150"]?mn["t150"]:mn["t140"], mdo=0;  //console.log(mn,md);
	//console.log(md[0].toString(16), md[1].toString(16), tiff_bps);
	var ver0 = md[mdo++], ver1 = md[mdo++];
	if (ver0 == 0x49 || ver1 == 0x58)  mdo+=2110;
	if (ver0 == 0x46) tree = 2;
	if (tiff_bps == 14) tree += 3;
	
	var vpred = [[0,0],[0,0]], bin=(img.isLE ? UTIF._binLE : UTIF._binBE);
	for(var i=0; i<2; i++) for(var j=0; j<2; j++) {  vpred[i][j] = bin.readShort(md,mdo);  mdo+=2;   }  // not sure here ... [i][j] or [j][i]
	//console.log(vpred);
	
	
	var max = 1 << tiff_bps & 0x7fff, step=0;
	var csize = bin.readShort(md,mdo);  mdo+=2;
	if (csize > 1) step = Math.floor(max / (csize-1));
	if (ver0 == 0x44 && ver1 == 0x20 && step > 0)  split = bin.readShort(md,562);
	
	
	var i;
	var row, col;
	var len, shl, diff;
	var min_v = 0;
	var hpred = [0,0];
	var huff = make_decoder(nikon_tree[tree]);
	
	//var g_input_offset=0, bitbuf=0, vbits=0, reset=0;
	var prm = [off,0,0,0];
	//console.log(split);  split = 170;
	
	for (min_v=row=0; row < height; row++) {
		if (split && row == split) {
			//free (huff);
			huff = make_decoder (nikon_tree[tree+1]);
			//max_v += (min_v = 16) << 1;
		}
		for (col=0; col < raw_width; col++) {
			i = getbithuff(data,prm,huff[0],huff);
			len = i  & 15;
			shl = i >>> 4;
			diff = (((getbithuff(data,prm,len-shl,0) << 1) + 1) << shl) >>> 1;
			if ((diff & (1 << (len-1))) == 0)
				diff -= (1 << len) - (shl==0?1:0);
			if (col < 2) hpred[col] = vpred[row & 1][col] += diff;
			else         hpred[col & 1] += diff;
			
			var clr = Math.min(Math.max(hpred[col & 1],0),(1<<tiff_bps)-1);
			var bti = (row*raw_width+col)*tiff_bps;  
			UTIF.decode._putsF(tgt, bti, clr<<(16-tiff_bps));
		}
	}
}
// put 16 bits
UTIF.decode._putsF= function(dt, pos, val) {  val = val<<(8-(pos&7));  var o=(pos>>>3);  dt[o]|=val>>>16;  dt[o+1]|=val>>>8;  dt[o+2]|=val;  }


UTIF.decode._getbithuff = function(data,prm,nbits, huff) {
	var zero_after_ff = 0;
	var get_byte = UTIF.decode._get_byte;
	var c;
  
	var off=prm[0], bitbuf=prm[1], vbits=prm[2], reset=prm[3];

	//if (nbits > 25) return 0;
	//if (nbits <  0) return bitbuf = vbits = reset = 0;
	if (nbits == 0 || vbits < 0) return 0; 
	while (!reset && vbits < nbits && (c = data[off++]) != -1 &&
		!(reset = zero_after_ff && c == 0xff && data[off++])) {
		//console.log("byte read into c");
		bitbuf = (bitbuf << 8) + c;
		vbits += 8;
	} 
	c = (bitbuf << (32-vbits)) >>> (32-nbits);
	if (huff) {
		vbits -= huff[c+1] >>> 8;  //console.log(c, huff[c]>>8);
		c =  huff[c+1]&255;
	} else
		vbits -= nbits;
	if (vbits < 0) throw "e";
  
	prm[0]=off;  prm[1]=bitbuf;  prm[2]=vbits;  prm[3]=reset;
  
	return c;
}

UTIF.decode._make_decoder = function(source) {
	var max, len, h, i, j;
	var huff = [];

	for (max=16; max!=0 && !source[max]; max--);
	var si=17;
	
	huff[0] = max;
	for (h=len=1; len <= max; len++)
		for (i=0; i < source[len]; i++, ++si)
			for (j=0; j < 1 << (max-len); j++)
				if (h <= 1 << max)
					huff[h++] = (len << 8) | source[si];
	return huff;
}

UTIF.decode._decodeNewJPEG = function(img, data, off, len, tgt, toff)
{
	len = Math.min(len, data.length-off);
	var tables = img["t347"], tlen = tables ? tables.length : 0, buff = new Uint8Array(tlen + len);
	
	if (tables) {
		var SOI = 216, EOI = 217, boff = 0;
		for (var i=0; i<(tlen-1); i++)
		{
			// Skip EOI marker from JPEGTables
			if (tables[i]==255 && tables[i+1]==EOI) break;
			buff[boff++] = tables[i];
		}

		// Skip SOI marker from data
		var byte1 = data[off], byte2 = data[off + 1];
		if (byte1!=255 || byte2!=SOI)
		{
			buff[boff++] = byte1;
			buff[boff++] = byte2;
		}
		for (var i=2; i<len; i++) buff[boff++] = data[off+i];
	}
	else for (var i=0; i<len; i++) buff[i] = data[off+i];

	if(img["t262"][0]==32803 || (img["t259"][0]==7 && img["t262"][0]==34892)) // lossless JPEG (used in DNG files)
	{
		var bps = img["t258"][0];//, dcdr = new LosslessJpegDecoder();
		//var time = Date.now();
		var out = UTIF.LosslessJpegDecode(buff), olen=out.length;  //console.log(olen);
		//var out = ULLJPG(buff), olen=out.length;  //console.log(olen);
		//console.log(Date.now()-time);
		
		if(false) {}
		else if(bps==16) {
			if(img.isLE) for(var i=0; i<olen; i++ ) {  tgt[toff+(i<<1)] = (out[i]&255);  tgt[toff+(i<<1)+1] = (out[i]>>>8);  }
			else         for(var i=0; i<olen; i++ ) {  tgt[toff+(i<<1)] = (out[i]>>>8);  tgt[toff+(i<<1)+1] = (out[i]&255);  }
		}
		else if(bps==14 || bps==12) {  // 4 * 14 == 56 == 7 * 8
			var rst = 16-bps;
			for(var i=0; i<olen; i++) UTIF.decode._putsF(tgt, i*bps, out[i]<<rst);
		}
		else if(bps==8) {
			for(var i=0; i<olen; i++) tgt[toff+i]=out[i];
		}
		else throw new Error("unsupported bit depth "+bps);
	}
	else
	{
		var parser = new UTIF.JpegDecoder();  parser.parse(buff);
		var decoded = parser.getData({"width":parser.width,"height":parser.height,"forceRGB":true,"isSourcePDF":false});
		for (var i=0; i<decoded.length; i++) tgt[toff + i] = decoded[i];
	}

	// PhotometricInterpretation is 6 (YCbCr) for JPEG, but after decoding we populate data in
	// RGB format, so updating the tag value
	if(img["t262"][0] == 6)  img["t262"][0] = 2;
}

UTIF.decode._decodeOldJPEGInit = function(img, data, off, len)
{
	var SOI = 216, EOI = 217, DQT = 219, DHT = 196, DRI = 221, SOF0 = 192, SOS = 218;
	var joff = 0, soff = 0, tables, sosMarker, isTiled = false, i, j, k;
	var jpgIchgFmt    = img["t513"], jifoff = jpgIchgFmt ? jpgIchgFmt[0] : 0;
	var jpgIchgFmtLen = img["t514"], jiflen = jpgIchgFmtLen ? jpgIchgFmtLen[0] : 0;
	var soffTag       = img["t324"] || img["t273"] || jpgIchgFmt;
	var ycbcrss       = img["t530"], ssx = 0, ssy = 0;
	var spp           = img["t277"]?img["t277"][0]:1;
	var jpgresint     = img["t515"];

	if(soffTag)
	{
		soff = soffTag[0];
		isTiled = (soffTag.length > 1);
	}

	if(!isTiled)
	{
		if(data[off]==255 && data[off+1]==SOI) return { jpegOffset: off };
		if(jpgIchgFmt!=null)
		{
			if(data[off+jifoff]==255 && data[off+jifoff+1]==SOI) joff = off+jifoff;
			else log("JPEGInterchangeFormat does not point to SOI");

			if(jpgIchgFmtLen==null) log("JPEGInterchangeFormatLength field is missing");
			else if(jifoff >= soff || (jifoff+jiflen) <= soff) log("JPEGInterchangeFormatLength field value is invalid");

			if(joff != null) return { jpegOffset: joff };
		}
	}

	if(ycbcrss!=null) {  ssx = ycbcrss[0];  ssy = ycbcrss[1];  }

	if(jpgIchgFmt!=null)
		if(jpgIchgFmtLen!=null)
			if(jiflen >= 2 && (jifoff+jiflen) <= soff)
			{
				if(data[off+jifoff+jiflen-2]==255 && data[off+jifoff+jiflen-1]==SOI) tables = new Uint8Array(jiflen-2);
				else tables = new Uint8Array(jiflen);

				for(i=0; i<tables.length; i++) tables[i] = data[off+jifoff+i];
				log("Incorrect JPEG interchange format: using JPEGInterchangeFormat offset to derive tables");
			}
			else log("JPEGInterchangeFormat+JPEGInterchangeFormatLength > offset to first strip or tile");

	if(tables == null)
	{
		var ooff = 0, out = [];
		out[ooff++] = 255; out[ooff++] = SOI;

		var qtables = img["t519"];
		if(qtables==null) throw new Error("JPEGQTables tag is missing");
		for(i=0; i<qtables.length; i++)
		{
			out[ooff++] = 255; out[ooff++] = DQT; out[ooff++] = 0; out[ooff++] = 67; out[ooff++] = i;
			for(j=0; j<64; j++) out[ooff++] = data[off+qtables[i]+j];
		}

		for(k=0; k<2; k++)
		{
			var htables = img[(k == 0) ? "t520" : "t521"];
			if(htables==null) throw new Error(((k == 0) ? "JPEGDCTables" : "JPEGACTables") + " tag is missing");
			for(i=0; i<htables.length; i++)
			{
				out[ooff++] = 255; out[ooff++] = DHT;
				//out[ooff++] = 0; out[ooff++] = 67; out[ooff++] = i;
				var nc = 19;
				for(j=0; j<16; j++) nc += data[off+htables[i]+j];

				out[ooff++] = (nc >>> 8); out[ooff++] = nc & 255;
				out[ooff++] = (i | (k << 4));
				for(j=0; j<16; j++) out[ooff++] = data[off+htables[i]+j];
				for(j=0; j<nc; j++) out[ooff++] = data[off+htables[i]+16+j];
			}
		}

		out[ooff++] = 255; out[ooff++] = SOF0;
		out[ooff++] = 0;  out[ooff++] = 8 + 3*spp;  out[ooff++] = 8;
		out[ooff++] = (img.height >>> 8) & 255;  out[ooff++] = img.height & 255;
		out[ooff++] = (img.width  >>> 8) & 255;  out[ooff++] = img.width  & 255;
		out[ooff++] = spp;
		if(spp==1) {  out[ooff++] = 1;  out[ooff++] = 17;  out[ooff++] = 0;  }
		else for(i=0; i<3; i++)
		{
			out[ooff++] = i + 1;
			out[ooff++] = (i != 0) ? 17 : (((ssx & 15) << 4) | (ssy & 15));
			out[ooff++] = i;
		}

		if(jpgresint!=null && jpgresint[0]!=0)
		{
			out[ooff++] = 255;  out[ooff++] = DRI;  out[ooff++] = 0;  out[ooff++] = 4;
			out[ooff++] = (jpgresint[0] >>> 8) & 255;
			out[ooff++] = jpgresint[0] & 255;
		}

		tables = new Uint8Array(out);
	}

	var sofpos = -1;
	i = 0;
	while(i < (tables.length - 1)) {
		if(tables[i]==255 && tables[i+1]==SOF0) {  sofpos = i; break;  }
		i++;
	}

	if(sofpos == -1)
	{
		var tmptab = new Uint8Array(tables.length + 10 + 3*spp);
		tmptab.set(tables);
		var tmpoff = tables.length;
		sofpos = tables.length;
		tables = tmptab;

		tables[tmpoff++] = 255; tables[tmpoff++] = SOF0;
		tables[tmpoff++] = 0;  tables[tmpoff++] = 8 + 3*spp;  tables[tmpoff++] = 8;
		tables[tmpoff++] = (img.height >>> 8) & 255;  tables[tmpoff++] = img.height & 255;
		tables[tmpoff++] = (img.width  >>> 8) & 255;  tables[tmpoff++] = img.width  & 255;
		tables[tmpoff++] = spp;
		if(spp==1) {  tables[tmpoff++] = 1;  tables[tmpoff++] = 17;  tables[tmpoff++] = 0;  }
		else for(i=0; i<3; i++)
		{
			tables[tmpoff++] = i + 1;
			tables[tmpoff++] = (i != 0) ? 17 : (((ssx & 15) << 4) | (ssy & 15));
			tables[tmpoff++] = i;
		}
	}

	if(data[soff]==255 && data[soff+1]==SOS)
	{
		var soslen = (data[soff+2]<<8) | data[soff+3];
		sosMarker = new Uint8Array(soslen+2);
		sosMarker[0] = data[soff];  sosMarker[1] = data[soff+1]; sosMarker[2] = data[soff+2];  sosMarker[3] = data[soff+3];
		for(i=0; i<(soslen-2); i++) sosMarker[i+4] = data[soff+i+4];
	}
	else
	{
		sosMarker = new Uint8Array(2 + 6 + 2*spp);
		var sosoff = 0;
		sosMarker[sosoff++] = 255;  sosMarker[sosoff++] = SOS;
		sosMarker[sosoff++] = 0;  sosMarker[sosoff++] = 6 + 2*spp;  sosMarker[sosoff++] = spp;
		if(spp==1) {  sosMarker[sosoff++] = 1;  sosMarker[sosoff++] = 0;  }
		else for(i=0; i<3; i++)
		{
			sosMarker[sosoff++] = i+1;  sosMarker[sosoff++] = (i << 4) | i;
		}
		sosMarker[sosoff++] = 0;  sosMarker[sosoff++] = 63;  sosMarker[sosoff++] = 0;
	}

	return { jpegOffset: off, tables: tables, sosMarker: sosMarker, sofPosition: sofpos };
}

UTIF.decode._decodeOldJPEG = function(img, data, off, len, tgt, toff)
{
	var i, dlen, tlen, buff, buffoff;
	var jpegData = UTIF.decode._decodeOldJPEGInit(img, data, off, len);

	if(jpegData.jpegOffset!=null)
	{
		dlen = off+len-jpegData.jpegOffset;
		buff = new Uint8Array(dlen);
		for(i=0; i<dlen; i++) buff[i] = data[jpegData.jpegOffset+i];
	}
	else
	{
		tlen = jpegData.tables.length;
		buff = new Uint8Array(tlen + jpegData.sosMarker.length + len + 2);
		buff.set(jpegData.tables);
		buffoff = tlen;

		buff[jpegData.sofPosition+5] = (img.height >>> 8) & 255;  buff[jpegData.sofPosition+6] = img.height & 255;
		buff[jpegData.sofPosition+7] = (img.width  >>> 8) & 255;  buff[jpegData.sofPosition+8] = img.width  & 255;

		if(data[off]!=255 || data[off+1]!=SOS)
		{
			buff.set(jpegData.sosMarker, buffoff);
			buffoff += sosMarker.length;
		}
		for(i=0; i<len; i++) buff[buffoff++] = data[off+i];
		buff[buffoff++] = 255;  buff[buffoff++] = EOI;
	}

	var parser = new UTIF.JpegDecoder();  parser.parse(buff);
	var decoded = parser.getData({"width":parser.width,"height":parser.height,"forceRGB":true,"isSourcePDF":false});
	for (var i=0; i<decoded.length; i++) tgt[toff + i] = decoded[i];

	// PhotometricInterpretation is 6 (YCbCr) for JPEG, but after decoding we populate data in
	// RGB format, so updating the tag value
	if(img["t262"] && img["t262"][0] == 6)  img["t262"][0] = 2;
}

UTIF.decode._decodePackBits = function(data, off, len, tgt, toff)
{
	var sa = new Int8Array(data.buffer), ta = new Int8Array(tgt.buffer), lim = off+len;
	while(off<lim)
	{
		var n = sa[off];  off++;
		if(n>=0  && n<128)    for(var i=0; i< n+1; i++) {  ta[toff]=sa[off];  toff++;  off++;   }
		if(n>=-127 && n<0) {  for(var i=0; i<-n+1; i++) {  ta[toff]=sa[off];  toff++;           }  off++;  }
	}
}

UTIF.decode._decodeThunder = function(data, off, len, tgt, toff)
{
	var d2 = [ 0, 1, 0, -1 ],  d3 = [ 0, 1, 2, 3, 0, -3, -2, -1 ];
	var lim = off+len, qoff = toff*2, px = 0;
	while(off<lim)
	{
		var b = data[off], msk = (b>>>6), n = (b&63);  off++;
		if(msk==3) { px=(n&15);  tgt[qoff>>>1] |= (px<<(4*(1-qoff&1)));  qoff++;   }
		if(msk==0) for(var i=0; i<n; i++) {  tgt[qoff>>>1] |= (px<<(4*(1-qoff&1)));  qoff++;   }
		if(msk==2) for(var i=0; i<2; i++) {  var d=(n>>>(3*(1-i)))&7;  if(d!=4) { px+=d3[d];  tgt[qoff>>>1] |= (px<<(4*(1-qoff&1)));  qoff++; }  }
		if(msk==1) for(var i=0; i<3; i++) {  var d=(n>>>(2*(2-i)))&3;  if(d!=2) { px+=d2[d];  tgt[qoff>>>1] |= (px<<(4*(1-qoff&1)));  qoff++; }  }
	}
}

UTIF.decode._dmap = { "1":0,"011":1,"000011":2,"0000011":3, "010":-1,"000010":-2,"0000010":-3  };
UTIF.decode._lens = ( function()
{
	var addKeys = function(lens, arr, i0, inc) {  for(var i=0; i<arr.length; i++) lens[arr[i]] = i0 + i*inc;  }

	var termW = "00110101,000111,0111,1000,1011,1100,1110,1111,10011,10100,00111,01000,001000,000011,110100,110101," // 15
	+ "101010,101011,0100111,0001100,0001000,0010111,0000011,0000100,0101000,0101011,0010011,0100100,0011000,00000010,00000011,00011010," // 31
	+ "00011011,00010010,00010011,00010100,00010101,00010110,00010111,00101000,00101001,00101010,00101011,00101100,00101101,00000100,00000101,00001010," // 47
	+ "00001011,01010010,01010011,01010100,01010101,00100100,00100101,01011000,01011001,01011010,01011011,01001010,01001011,00110010,00110011,00110100";

	var termB = "0000110111,010,11,10,011,0011,0010,00011,000101,000100,0000100,0000101,0000111,00000100,00000111,000011000," // 15
	+ "0000010111,0000011000,0000001000,00001100111,00001101000,00001101100,00000110111,00000101000,00000010111,00000011000,000011001010,000011001011,000011001100,000011001101,000001101000,000001101001," // 31
	+ "000001101010,000001101011,000011010010,000011010011,000011010100,000011010101,000011010110,000011010111,000001101100,000001101101,000011011010,000011011011,000001010100,000001010101,000001010110,000001010111," // 47
	+ "000001100100,000001100101,000001010010,000001010011,000000100100,000000110111,000000111000,000000100111,000000101000,000001011000,000001011001,000000101011,000000101100,000001011010,000001100110,000001100111";

	var makeW = "11011,10010,010111,0110111,00110110,00110111,01100100,01100101,01101000,01100111,011001100,011001101,011010010,011010011,011010100,011010101,011010110,"
	+ "011010111,011011000,011011001,011011010,011011011,010011000,010011001,010011010,011000,010011011";

	var makeB = "0000001111,000011001000,000011001001,000001011011,000000110011,000000110100,000000110101,0000001101100,0000001101101,0000001001010,0000001001011,0000001001100,"
	+ "0000001001101,0000001110010,0000001110011,0000001110100,0000001110101,0000001110110,0000001110111,0000001010010,0000001010011,0000001010100,0000001010101,0000001011010,"
	+ "0000001011011,0000001100100,0000001100101";

	var makeA = "00000001000,00000001100,00000001101,000000010010,000000010011,000000010100,000000010101,000000010110,000000010111,000000011100,000000011101,000000011110,000000011111";

	termW = termW.split(",");  termB = termB.split(",");  makeW = makeW.split(",");  makeB = makeB.split(",");  makeA = makeA.split(",");

	var lensW = {}, lensB = {};
	addKeys(lensW, termW, 0, 1);  addKeys(lensW, makeW, 64,64);  addKeys(lensW, makeA, 1792,64);
	addKeys(lensB, termB, 0, 1);  addKeys(lensB, makeB, 64,64);  addKeys(lensB, makeA, 1792,64);
	return [lensW, lensB];
} )();

UTIF.decode._decodeG4 = function(data, off, slen, tgt, toff, w, fo)
{
	var U = UTIF.decode, boff=off<<3, len=0, wrd="";	// previous starts with 1
	var line=[], pline=[];  for(var i=0; i<w; i++) pline.push(0);  pline=U._makeDiff(pline);
	var a0=0, a1=0, a2=0, b1=0, b2=0, clr=0;
	var y=0, mode="", toRead=0;
	var bipl = Math.ceil(w/8)*8;

	while((boff>>>3)<off+slen)
	{
		b1 = U._findDiff(pline, a0+(a0==0?0:1), 1-clr), b2 = U._findDiff(pline, b1, clr);	// could be precomputed
		var bit =0;
		if(fo==1) bit = (data[boff>>>3]>>>(7-(boff&7)))&1;
		if(fo==2) bit = (data[boff>>>3]>>>(  (boff&7)))&1;
		boff++;  wrd+=bit;
		if(mode=="H")
		{
			if(U._lens[clr][wrd]!=null)
			{
				var dl=U._lens[clr][wrd];  wrd="";  len+=dl;
				if(dl<64) {  U._addNtimes(line,len,clr);  a0+=len;  clr=1-clr;  len=0;  toRead--;  if(toRead==0) mode="";  }
			}
		}
		else
		{
			if(wrd=="0001")  {  wrd="";  U._addNtimes(line,b2-a0,clr);  a0=b2;   }
			if(wrd=="001" )  {  wrd="";  mode="H";  toRead=2;  }
			if(U._dmap[wrd]!=null) {  a1 = b1+U._dmap[wrd];  U._addNtimes(line, a1-a0, clr);  a0=a1;  wrd="";  clr=1-clr;  }
		}
		if(line.length==w && mode=="")
		{
			U._writeBits(line, tgt, toff*8+y*bipl);
			clr=0;  y++;  a0=0;
			pline=U._makeDiff(line);  line=[];
		}
		//if(wrd.length>150) {  log(wrd);  break;  throw "e";  }
	}
}

UTIF.decode._findDiff = function(line, x, clr) {  for(var i=0; i<line.length; i+=2) if(line[i]>=x && line[i+1]==clr)  return line[i];  }

UTIF.decode._makeDiff = function(line)
{
	var out = [];  if(line[0]==1) out.push(0,1);
	for(var i=1; i<line.length; i++) if(line[i-1]!=line[i]) out.push(i, line[i]);
	out.push(line.length,0,line.length,1);  return out;
}

UTIF.decode._decodeG3 = function(data, off, slen, tgt, toff, w, fo, twoDim)
{
	var U = UTIF.decode, boff=off<<3, len=0, wrd="";
	var line=[], pline=[];  for(var i=0; i<w; i++) line.push(0);
	var a0=0, a1=0, a2=0, b1=0, b2=0, clr=0;
	var y=-1, mode="", toRead=0, is1D=true;
	var bipl = Math.ceil(w/8)*8;
	while((boff>>>3)<off+slen)
	{
		b1 = U._findDiff(pline, a0+(a0==0?0:1), 1-clr), b2 = U._findDiff(pline, b1, clr);	// could be precomputed
		var bit =0;
		if(fo==1) bit = (data[boff>>>3]>>>(7-(boff&7)))&1;
		if(fo==2) bit = (data[boff>>>3]>>>(  (boff&7)))&1;
		boff++;  wrd+=bit;

		if(is1D)
		{
			if(U._lens[clr][wrd]!=null)
			{
				var dl=U._lens[clr][wrd];  wrd="";  len+=dl;
				if(dl<64) {  U._addNtimes(line,len,clr);  clr=1-clr;  len=0;  }
			}
		}
		else
		{
			if(mode=="H")
			{
				if(U._lens[clr][wrd]!=null)
				{
					var dl=U._lens[clr][wrd];  wrd="";  len+=dl;
					if(dl<64) {  U._addNtimes(line,len,clr);  a0+=len;  clr=1-clr;  len=0;  toRead--;  if(toRead==0) mode="";  }
				}
			}
			else
			{
				if(wrd=="0001")  {  wrd="";  U._addNtimes(line,b2-a0,clr);  a0=b2;   }
				if(wrd=="001" )  {  wrd="";  mode="H";  toRead=2;  }
				if(U._dmap[wrd]!=null) {  a1 = b1+U._dmap[wrd];  U._addNtimes(line, a1-a0, clr);  a0=a1;  wrd="";  clr=1-clr;  }
			}
		}
		if(wrd.endsWith("000000000001")) // needed for some files
		{
			if(y>=0) U._writeBits(line, tgt, toff*8+y*bipl);
			if(twoDim) {
				if(fo==1) is1D = ((data[boff>>>3]>>>(7-(boff&7)))&1)==1;
				if(fo==2) is1D = ((data[boff>>>3]>>>(  (boff&7)))&1)==1;
				boff++;
			}
			//log("EOL",y, "next 1D:", is1D);
			wrd="";  clr=0;  y++;  a0=0;
			pline=U._makeDiff(line);  line=[];
		}
	}
	if(line.length==w) U._writeBits(line, tgt, toff*8+y*bipl);
}

UTIF.decode._addNtimes = function(arr, n, val) {  for(var i=0; i<n; i++) arr.push(val);  }

UTIF.decode._writeBits = function(bits, tgt, boff)
{
	for(var i=0; i<bits.length; i++) tgt[(boff+i)>>>3] |= (bits[i]<<(7-((boff+i)&7)));
}

UTIF.decode._decodeLZW=UTIF.decode._decodeLZW=function(){var e,U,Z,u,K=0,V=0,g=0,N=0,O=function(){var S=e>>>3,A=U[S]<<16|U[S+1]<<8|U[S+2],j=A>>>24-(e&7)-V&(1<<V)-1;
e+=V;return j},h=new Uint32Array(4096*4),w=0,m=function(S){if(S==w)return;w=S;g=1<<S;N=g+1;for(var A=0;
A<N+1;A++){h[4*A]=h[4*A+3]=A;h[4*A+1]=65535;h[4*A+2]=1}},i=function(S){V=S+1;K=N+1},D=function(S){var A=S<<2,j=h[A+2],a=u+j-1;
while(A!=65535){Z[a--]=h[A];A=h[A+1]}u+=j},L=function(S,A){var j=K<<2,a=S<<2;h[j]=h[(A<<2)+3];h[j+1]=a;
h[j+2]=h[a+2]+1;h[j+3]=h[a+3];K++;if(K+1==1<<V&&V!=12)V++},T=function(S,A,j,a,n,q){e=A<<3;U=S;Z=a;u=n;
var B=A+j<<3,_=0,t=0;m(q);i(q);while(e<B&&(_=O())!=N){if(_==g){i(q);_=O();if(_==N)break;D(_)}else{if(_<K){D(_);
L(t,_)}else{L(t,t);D(K-1)}}t=_}return u};return T}();

UTIF.tags = {};
//UTIF.ttypes = {  256:3,257:3,258:3,   259:3, 262:3,  273:4,  274:3, 277:3,278:4,279:4, 282:5, 283:5, 284:3, 286:5,287:5, 296:3, 305:2, 306:2, 338:3, 513:4, 514:4, 34665:4  };
// start at tag 250
UTIF._types = function() {
	var main = new Array(250);  main.fill(0);
	main = main.concat([0,0,0,0,4,3,3,3,3,3,0,0,3,0,0,0,3,0,0,2,2,2,2,4,3,0,0,3,4,4,3,3,5,5,3,2,5,5,0,0,0,0,4,4,0,0,3,3,0,0,0,0,0,0,0,2,2,0,0,0,0,0,0,0,0,2,2,3,5,5,3,0,3,3,4,4,4,3,4,0,0,0,0,0,0,0,0,0,3,3,0,0,0,0,0,0,0,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	var rest = {33432: 2, 33434: 5, 33437: 5, 34665: 4, 34850: 3, 34853: 4, 34855: 3, 34864: 3, 34866: 4, 36864: 7, 36867: 2, 36868: 2, 37121: 7, 37377: 10, 37378: 5, 37380: 10, 37381: 5, 37383: 3, 37384: 3, 37385: 3, 37386: 5, 37510: 7, 37520: 2, 37521: 2, 37522: 2, 40960: 7, 40961: 3, 40962: 4, 40963: 4, 40965: 4, 41486: 5, 41487: 5, 41488: 3, 41985: 3, 41986: 3, 41987: 3, 41988: 5, 41989: 3, 41990: 3, 41993: 3, 41994: 3, 41995: 7, 41996: 3, 42032: 2, 42033: 2, 42034: 5, 42036: 2, 42037: 2, 59932: 7};
	return {
		basic: {
			main: main,
			rest: rest
		},
		gps: {
			main: [1,2,5,2,5,1,5,5,0,9],
			rest: {18:2,29:2}
		}
	}
}();

UTIF._readIFD = function(bin, data, offset, ifds, depth, prm)
{
	var cnt = bin.readUshort(data, offset);  offset+=2;
	var ifd = {};

	if(prm.debug) log("   ".repeat(depth),ifds.length-1,">>>----------------");
	for(var i=0; i<cnt; i++)
	{
		var tag  = bin.readUshort(data, offset);    offset+=2;
		var type = bin.readUshort(data, offset);    offset+=2;
		var num  = bin.readUint  (data, offset);    offset+=4;
		var voff = bin.readUint  (data, offset);    offset+=4;
		
		var arr = [];
		//ifd["t"+tag+"-"+UTIF.tags[tag]] = arr;
		if(type== 1 || type==7) {  arr = new Uint8Array(data.buffer, (num<5 ? offset-4 : voff), num);  }
		if(type== 2) {  var o0 = (num<5 ? offset-4 : voff), c=data[o0], len=Math.max(0, Math.min(num-1,data.length-o0));
						if(c<128 || len==0) arr.push( bin.readASCII(data, o0, len) );
						else      arr = new Uint8Array(data.buffer, o0, len);  }
		if(type== 3) {  for(var j=0; j<num; j++) arr.push(bin.readUshort(data, (num<3 ? offset-4 : voff)+2*j));  }
		if(type== 4 
		|| type==13) {  for(var j=0; j<num; j++) arr.push(bin.readUint  (data, (num<2 ? offset-4 : voff)+4*j));  }
		if(type== 5 || type==10) {  
			var ri = type==5 ? bin.readUint : bin.readInt;
			for(var j=0; j<num; j++) arr.push([ri(data, voff+j*8), ri(data,voff+j*8+4)]);  }
		if(type== 8) {  for(var j=0; j<num; j++) arr.push(bin.readShort (data, (num<3 ? offset-4 : voff)+2*j));  }
		if(type== 9) {  for(var j=0; j<num; j++) arr.push(bin.readInt   (data, (num<2 ? offset-4 : voff)+4*j));  }
		if(type==11) {  for(var j=0; j<num; j++) arr.push(bin.readFloat (data, voff+j*4));  }
		if(type==12) {  for(var j=0; j<num; j++) arr.push(bin.readDouble(data, voff+j*8));  }
		
		if(num!=0 && arr.length==0) {  log(tag, "unknown TIFF tag type: ", type, "num:",num);  if(i==0)return;  continue;  }
		if(prm.debug) log("   ".repeat(depth), tag, type, UTIF.tags[tag], arr);
		
		ifd["t"+tag] = arr;
		
		if(tag==330 && ifd["t272"] && ifd["t272"][0]=="DSLR-A100") {  } 
		else if(tag==330 || tag==34665 || tag==34853 || (tag==50740 && bin.readUshort(data,bin.readUint(arr,0))<300  ) ||tag==61440) {
			var oarr = tag==50740 ? [bin.readUint(arr,0)] : arr;
			var subfd = [];
			for(var j=0; j<oarr.length; j++) UTIF._readIFD(bin, data, oarr[j], subfd, depth+1, prm);
			if(tag==  330) ifd.subIFD = subfd;
			if(tag==34665) ifd.exifIFD = subfd[0];
			if(tag==34853) ifd.gpsiIFD = subfd[0];  //console.log("gps", subfd[0]);  }
			if(tag==50740) ifd.dngPrvt = subfd[0];
			if(tag==61440) ifd.fujiIFD = subfd[0];
		}
		if(tag==37500 && prm.parseMN) {
			var mn = arr;
			//console.log(bin.readASCII(mn,0,mn.length), mn);
			if(bin.readASCII(mn,0,5)=="Nikon")  ifd.makerNote = UTIF["decode"](mn.slice(10).buffer)[0];
			else if(bin.readUshort(data,voff)<300 && bin.readUshort(data,voff+4)<=12){
				var subsub=[];  UTIF._readIFD(bin, data, voff, subsub, depth+1, prm);
				ifd.makerNote = subsub[0];
			}
		}
	}
	ifds.push(ifd);
	if(prm.debug) log("   ".repeat(depth),"<<<---------------");
	return offset;
}

UTIF._writeIFD = function(bin, types, data, offset, ifd)
{
	var keys = Object.keys(ifd), knum=keys.length;  if(ifd["exifIFD"]) knum--;  if(ifd["gpsiIFD"]) knum--;
	bin.writeUshort(data, offset, knum);  offset+=2;

	var eoff = offset + knum*12 + 4;

	for(var ki=0; ki<keys.length; ki++)
	{
		var key = keys[ki];  if(key=="t34665" || key=="t34853") continue;  
		if(key=="exifIFD") key="t34665";  if(key=="gpsiIFD") key="t34853";
		var tag = parseInt(key.slice(1)), type = types.main[tag];  if(type==null) type=types.rest[tag];		
		if(type==null || type==0) throw new Error("unknown type of tag: "+tag);
		//console.log(offset+":", tag, type, eoff);
		var val = ifd[key];  
		if(tag==34665) {
			var outp = UTIF._writeIFD(bin, types, data, eoff, ifd["exifIFD"]);
			val = [eoff];  eoff = outp[1];
		}
		if(tag==34853) {
			var outp = UTIF._writeIFD(bin, UTIF._types.gps, data, eoff, ifd["gpsiIFD"]);
			val = [eoff];  eoff = outp[1];
		}
		if(type==2) val=val[0]+"\u0000";  var num = val.length;
		bin.writeUshort(data, offset, tag );  offset+=2;
		bin.writeUshort(data, offset, type);  offset+=2;
		bin.writeUint  (data, offset, num );  offset+=4;

		var dlen = [-1, 1, 1, 2, 4, 8, 0, 1, 0, 4, 8, 0, 8][type] * num;  //if(dlen<1) throw "e";
		var toff = offset;
		if(dlen>4) {  bin.writeUint(data, offset, eoff);  toff=eoff;  }

		if     (type== 1 || type==7) {  for(var i=0; i<num; i++) data[toff+i] = val[i];  }
		else if(type== 2) {  bin.writeASCII(data, toff, val);   }
		else if(type== 3) {  for(var i=0; i<num; i++) bin.writeUshort(data, toff+2*i, val[i]);    }
		else if(type== 4) {  for(var i=0; i<num; i++) bin.writeUint  (data, toff+4*i, val[i]);    }
		else if(type== 5 || type==10) {  
			var wr = type==5?bin.writeUint:bin.writeInt;
			for(var i=0; i<num; i++) {  
			var v=val[i],nu=v[0],de=v[1];  if(nu==null) throw "e";  wr(data, toff+8*i, nu);  wr(data, toff+8*i+4, de);  }   }
		else if(type== 9) {  for(var i=0; i<num; i++) bin.writeInt   (data, toff+4*i, val[i]);    }
		else if(type==12) {  for(var i=0; i<num; i++) bin.writeDouble(data, toff+8*i, val[i]);    }
		else throw type;

		if(dlen>4) {  dlen += (dlen&1);  eoff += dlen;  }
		offset += 4;
	}
	return [offset, eoff];
}

UTIF.toRGBA8 = function(out, scl)
{
	var w = out.width, h = out.height, area = w*h, qarea = area*4, data = out.data;
	var img = new Uint8Array(area*4);
	//console.log(out);
	// 0: WhiteIsZero, 1: BlackIsZero, 2: RGB, 3: Palette color, 4: Transparency mask, 5: CMYK
	var intp = (out["t262"] ? out["t262"][0]: 2), bps = (out["t258"]?Math.min(32,out["t258"][0]):1);
	if(out["t262"]==null && bps==1) intp=0;
	//log("interpretation: ", intp, "bps", bps, out);
	if(false) {}
	else if(intp==0)
	{
		var bpl = Math.ceil(bps*w/8);
		for(var y=0; y<h; y++) {
			var off = y*bpl, io = y*w;
			if(bps== 1) for(var i=0; i<w; i++) {  var qi=(io+i)<<2, px=((data[off+(i>>3)])>>(7-  (i&7)))& 1;  img[qi]=img[qi+1]=img[qi+2]=( 1-px)*255;  img[qi+3]=255;    }
			if(bps== 4) for(var i=0; i<w; i++) {  var qi=(io+i)<<2, px=((data[off+(i>>1)])>>(4-4*(i&1)))&15;  img[qi]=img[qi+1]=img[qi+2]=(15-px)* 17;  img[qi+3]=255;    }
			if(bps== 8) for(var i=0; i<w; i++) {  var qi=(io+i)<<2, px=data[off+i];  img[qi]=img[qi+1]=img[qi+2]=255-px;  img[qi+3]=255;    }
		}
	}
	else if(intp==1)
	{
		var smpls = out["t258"]?out["t258"].length : 1;
		var bpl = Math.ceil(smpls*bps*w/8);
		if(scl==null) scl=1/256;
		
		for(var y=0; y<h; y++) {
			var off = y*bpl, io = y*w;
			if(bps== 1) for(var i=0; i<w; i++) {  var qi=(io+i)<<2, px=((data[off+(i>>3)])>>(7-  (i&7)))&1;   img[qi]=img[qi+1]=img[qi+2]=(px)*255;  img[qi+3]=255;    }
			if(bps== 2) for(var i=0; i<w; i++) {  var qi=(io+i)<<2, px=((data[off+(i>>2)])>>(6-2*(i&3)))&3;   img[qi]=img[qi+1]=img[qi+2]=(px)* 85;  img[qi+3]=255;    }
			if(bps== 8) for(var i=0; i<w; i++) {  var qi=(io+i)<<2, px=data[off+i*smpls];  img[qi]=img[qi+1]=img[qi+2]=    px;  img[qi+3]=255;    }
			if(bps==16) for(var i=0; i<w; i++) {  var qi=(io+i)<<2, o=off+(2*i), px=(data[o+1]<<8)|data[o];  img[qi]=img[qi+1]=img[qi+2]= Math.min(255,~~(px*scl));  img[qi+3]=255;    } // ladoga.tif
		}
	}
	else if(intp==2)
	{
		var smpls = out["t258"]?out["t258"].length : 3;		
		if(bps== 8) 
		{
			if(smpls==4) for(var i=0; i<qarea; i++) img[i] = data[i];
			if(smpls==3) for(var i=0; i<area; i++) {  var qi=i<<2, ti=i*3;  img[qi]=data[ti];  img[qi+1]=data[ti+1];  img[qi+2]=data[ti+2];  img[qi+3]=255;    }
			// e.g. corel_photopaint_rgba.tif from https://github.com/jkriege2/TinyTIFF/blob/f6739ffd351b782e6cf9a81e6a61e8faa615e629/tests/tinytiffreader_test/corel_photopaint_rgba.tif
			if(smpls==5) for(var i=0; i<area; i++) {  var qi=i<<2, ti=i*5;  img[qi]=data[ti];  img[qi+1]=data[ti+1];  img[qi+2]=data[ti+2];  img[qi+3]=data[ti+3];    }
		}
		else{  // 3x 16-bit channel
			if(smpls==4) for(var i=0; i<area; i++) {  var qi=i<<2, ti=i*8+1;  img[qi]=data[ti];  img[qi+1]=data[ti+2];  img[qi+2]=data[ti+4];  img[qi+3]=data[ti+6];    }
			if(smpls==3) for(var i=0; i<area; i++) {  var qi=i<<2, ti=i*6+1;  img[qi]=data[ti];  img[qi+1]=data[ti+2];  img[qi+2]=data[ti+4];  img[qi+3]=255;           }
		}
	}
	else if(intp==3)
	{
		var map = out["t320"];
		var smpls = out["t258"]?out["t258"].length : 1;
		var bpl = Math.ceil(smpls*bps*w/8);
		var cn = 1<<bps;
		
		for(var y=0; y<h; y++) 
			for(var x=0; x<w; x++) {  
				var i = y*w+x;
				var qi=i<<2, mi=0;
				var dof = y*bpl;
				if(false) {}
				else if(bps==1) mi=(data[dof+(x>>>3)]>>>(7-(x&7)))&1;
				else if(bps==2) mi=(data[dof+(x>>>2)]>>>(6-2*(x&3)))&3;
				else if(bps==4) mi=(data[dof+(x>>>1)]>>>(4-4*(x&1)))&15;
				else if(bps==8) mi= data[dof+x*smpls]; 
				else throw bps;
				img[qi]=(map[mi]>>8);  img[qi+1]=(map[cn+mi]>>8);  img[qi+2]=(map[cn+cn+mi]>>8);  img[qi+3]=255;   
			}
	}
	else if(intp==5) 
	{
		var smpls = out["t258"]?out["t258"].length : 4;
		var gotAlpha = smpls>4 ? 1 : 0;
		for(var i=0; i<area; i++) {
			var qi=i<<2, si=i*smpls;  var C=255-data[si], M=255-data[si+1], Y=255-data[si+2], K=(255-data[si+3])*(1/255);
			img[qi]=~~(C*K+0.5);  img[qi+1]=~~(M*K+0.5);  img[qi+2]=~~(Y*K+0.5);  img[qi+3]=255*(1-gotAlpha)+data[si+4]*gotAlpha;
		}
	}
	else if(intp==6 && out["t278"]) {  // only for DSC_1538.TIF
		var rps = out["t278"][0];
		for(var y=0; y<h; y+=rps) {
			var i=(y*w), len = rps*w;
			
			for(var j=0; j<len; j++) {
				var qi = 4*(i+j), si = 3*i+4*(j>>>1);
				var Y = data[si+(j&1)], Cb=data[si+2]-128, Cr=data[si+3]-128;
				
				var r = Y + ( (Cr >> 2) + (Cr >> 3) + (Cr >> 5) ) ;
				var g = Y - ( (Cb >> 2) + (Cb >> 4) + (Cb >> 5)) - ( (Cr >> 1) + (Cr >> 3) + (Cr >> 4) + (Cr >> 5)) ;
				var b = Y + ( Cb + (Cb >> 1) + (Cb >> 2) + (Cb >> 6)) ;
				
				img[qi  ]=Math.max(0,Math.min(255,r));
				img[qi+1]=Math.max(0,Math.min(255,g));
				img[qi+2]=Math.max(0,Math.min(255,b));
				img[qi+3]=255;
			}
		}
	}
	else log("Unknown Photometric interpretation: "+intp);
	return img;
}

UTIF.replaceIMG = function(imgs)
{
	if(imgs==null) imgs = document.getElementsByTagName("img");
	var sufs = ["tif","tiff","dng","cr2","nef"]
	for (var i=0; i<imgs.length; i++)
	{
		var img=imgs[i], src=img.getAttribute("src");  if(src==null) continue;
		var suff=src.split(".").pop().toLowerCase();
		if(sufs.indexOf(suff)==-1) continue;
		var xhr = new XMLHttpRequest();  UTIF._xhrs.push(xhr);  UTIF._imgs.push(img);
		xhr.open("GET", src);  xhr.responseType = "arraybuffer";
		xhr.onload = UTIF._imgLoaded;   xhr.send();
	}
}

UTIF._xhrs = [];  UTIF._imgs = [];
UTIF._imgLoaded = function(e) {
	var ind = UTIF._xhrs.indexOf(e.target), img = UTIF._imgs[ind];
	UTIF._xhrs.splice(ind,1);  UTIF._imgs.splice(ind,1);
	
	img.setAttribute("src",UTIF.bufferToURI(e.target.response));
}

UTIF.bufferToURI = function(buff) {
	var ifds = UTIF.decode(buff);  //console.log(ifds);
	var vsns = ifds, ma=0, page=vsns[0];  if(ifds[0].subIFD) vsns = vsns.concat(ifds[0].subIFD);
	for(var i=0; i<vsns.length; i++) {
		var img = vsns[i];
		if(img["t258"]==null || img["t258"].length<3) continue;
		var ar = img["t256"]*img["t257"];
		if(ar>ma) {  ma=ar;  page=img;  }
	}
	UTIF.decodeImage(buff, page, ifds);
	var rgba = UTIF.toRGBA8(page), w=page.width, h=page.height;
	
	var cnv = document.createElement("canvas");  cnv.width=w;  cnv.height=h;
	var ctx = cnv.getContext("2d");
	var imgd = new ImageData(new Uint8ClampedArray(rgba.buffer),w,h);
	ctx.putImageData(imgd,0,0);
	return cnv.toDataURL();
}


UTIF._binBE =
{
	nextZero   : function(data, o) {  while(data[o]!=0) o++;  return o;  },
	readUshort : function(buff, p) {  return (buff[p]<< 8) |  buff[p+1];  },
	readShort  : function(buff, p) {  var a=UTIF._binBE.ui8;  a[0]=buff[p+1];  a[1]=buff[p+0];                                    return UTIF._binBE. i16[0];  },
	readInt    : function(buff, p) {  var a=UTIF._binBE.ui8;  a[0]=buff[p+3];  a[1]=buff[p+2];  a[2]=buff[p+1];  a[3]=buff[p+0];  return UTIF._binBE. i32[0];  },
	readUint   : function(buff, p) {  var a=UTIF._binBE.ui8;  a[0]=buff[p+3];  a[1]=buff[p+2];  a[2]=buff[p+1];  a[3]=buff[p+0];  return UTIF._binBE.ui32[0];  },
	readASCII  : function(buff, p, l) {  var s = "";   for(var i=0; i<l; i++) s += String.fromCharCode(buff[p+i]);   return s; },
	readFloat  : function(buff, p) {  var a=UTIF._binBE.ui8;  for(var i=0;i<4;i++) a[i]=buff[p+3-i];  return UTIF._binBE.fl32[0];  },
	readDouble : function(buff, p) {  var a=UTIF._binBE.ui8;  for(var i=0;i<8;i++) a[i]=buff[p+7-i];  return UTIF._binBE.fl64[0];  },

	writeUshort: function(buff, p, n) {  buff[p] = (n>> 8)&255;  buff[p+1] =  n&255;  },
	writeInt   : function(buff, p, n) {  var a=UTIF._binBE.ui8;  UTIF._binBE.i32[0]=n;  buff[p+3]=a[0];  buff[p+2]=a[1];  buff[p+1]=a[2];  buff[p+0]=a[3];  },
	writeUint  : function(buff, p, n) {  buff[p] = (n>>24)&255;  buff[p+1] = (n>>16)&255;  buff[p+2] = (n>>8)&255;  buff[p+3] = (n>>0)&255;  },
	writeASCII : function(buff, p, s) {  for(var i = 0; i < s.length; i++)  buff[p+i] = s.charCodeAt(i);  },
	writeDouble: function(buff, p, n)
	{
		UTIF._binBE.fl64[0] = n;
		for (var i = 0; i < 8; i++) buff[p + i] = UTIF._binBE.ui8[7 - i];
	}
}
UTIF._binBE.ui8  = new Uint8Array  (8);
UTIF._binBE.i16  = new Int16Array  (UTIF._binBE.ui8.buffer);
UTIF._binBE.i32  = new Int32Array  (UTIF._binBE.ui8.buffer);
UTIF._binBE.ui32 = new Uint32Array (UTIF._binBE.ui8.buffer);
UTIF._binBE.fl32 = new Float32Array(UTIF._binBE.ui8.buffer);
UTIF._binBE.fl64 = new Float64Array(UTIF._binBE.ui8.buffer);

UTIF._binLE =
{
	nextZero   : UTIF._binBE.nextZero,
	readUshort : function(buff, p) {  return (buff[p+1]<< 8) |  buff[p];  },
	readShort  : function(buff, p) {  var a=UTIF._binBE.ui8;  a[0]=buff[p+0];  a[1]=buff[p+1];                                    return UTIF._binBE. i16[0];  },
	readInt    : function(buff, p) {  var a=UTIF._binBE.ui8;  a[0]=buff[p+0];  a[1]=buff[p+1];  a[2]=buff[p+2];  a[3]=buff[p+3];  return UTIF._binBE. i32[0];  },
	readUint   : function(buff, p) {  var a=UTIF._binBE.ui8;  a[0]=buff[p+0];  a[1]=buff[p+1];  a[2]=buff[p+2];  a[3]=buff[p+3];  return UTIF._binBE.ui32[0];  },
	readASCII  : UTIF._binBE.readASCII,
	readFloat  : function(buff, p) {  var a=UTIF._binBE.ui8;  for(var i=0;i<4;i++) a[i]=buff[p+  i];  return UTIF._binBE.fl32[0];  },
	readDouble : function(buff, p) {  var a=UTIF._binBE.ui8;  for(var i=0;i<8;i++) a[i]=buff[p+  i];  return UTIF._binBE.fl64[0];  },
	
	writeUshort: function(buff, p, n) {  buff[p] = (n)&255;  buff[p+1] =  (n>>8)&255;  },
	writeInt   : function(buff, p, n) {  var a=UTIF._binBE.ui8;  UTIF._binBE.i32[0]=n;  buff[p+0]=a[0];  buff[p+1]=a[1];  buff[p+2]=a[2];  buff[p+3]=a[3];  },
	writeUint  : function(buff, p, n) {  buff[p] = (n>>>0)&255;  buff[p+1] = (n>>>8)&255;  buff[p+2] = (n>>>16)&255;  buff[p+3] = (n>>>24)&255;  },
	writeASCII : UTIF._binBE.writeASCII
}
UTIF._copyTile = function(tb, tw, th, b, w, h, xoff, yoff)
{
	//log("copyTile", tw, th,  w, h, xoff, yoff);
	var xlim = Math.min(tw, w-xoff);
	var ylim = Math.min(th, h-yoff);
	for(var y=0; y<ylim; y++)
	{
		var tof = (yoff+y)*w+xoff;
		var sof = y*tw;
		for(var x=0; x<xlim; x++) b[tof+x] = tb[sof+x];
	}
}

UTIF.LosslessJpegDecode =function(){var y,D,j,H,F,i,l,A,C,e;function q(){return y[D++]}function a(){return y[D++]<<8|y[D++]}function b(){var p=q(),r=[0,0,0,255],c=[],E=8;
for(var z=0;z<16;z++)c[z]=q();for(var z=0;z<16;z++){for(var G=0;G<c[z];G++){var I=m(r,0,z+1,1);r[I+3]=q()}}var t=new Uint8Array(1<<E);
C[p]=[new Uint8Array(r),t];for(var z=0;z<1<<E;z++){var u=E,s=z,k=0,J=0;while(r[k+3]==255&&u!=0){J=s>>--u&1;
k=r[k+J]}t[z]=k}}function m(p,r,c,z){if(p[r+3]!=255)return 0;if(c==0)return r;for(var G=0;G<2;G++){if(p[r+G]==0){p[r+G]=p.length;
p.push(0,0,z,255)}var I=m(p,p[r+G],c-1,z+1);if(I!=0)return I}return 0}function B(p){var r=p.e,c=p.c;
while(r<25&&p.a<p.d){var z=p.data[p.a++];if(!p.b)p.a+=z+1>>>8;c=c<<8|z;r+=8}p.e=r;p.c=c}function g(p,r){if(r.e<p)B(r);
return r.c>>(r.e-=p)&65535>>16-p}function w(p,r){var c=p[0],z=0,G=255,I=0;if(r.e<16)B(r);var E=r.c>>r.e-8&255;
z=p[1][E];G=c[z+3];r.e-=c[z+2];while(G==255){I=r.c>>--r.e&1;z=c[z+I];G=c[z+3]}return G}function o(p,r){if(p<32768>>16-r)p+=-(1<<r)+1;
return p}function x(p,r){var c=w(p,r);if(c==0)return 0;if(c==16)return-32768;var z=g(c,r);return o(z,c)}function n(p,r,c){var z=i,G=H,I=l,E=e;
for(var t=0;t<z;t++){p[t]=x(E[t],c)+(1<<j-1)}for(var u=z;u<r;u+=z){for(var t=0;t<z;t++)p[u+t]=x(E[t],c)+p[u+t-z]}var s=r;
for(var k=1;k<G;k++){for(var t=0;t<z;t++){p[s+t]=x(E[t],c)+p[s+t-r]}for(var u=z;u<r;u+=z){for(var t=0;
t<z;t++){var J=s+u+t,K=p[J-z],v=0;if(I==0)v=0;else if(I==1)v=K;else if(I==2)v=p[J-r];else if(I==3)v=p[J-r-z];
else if(I==4)v=K+(p[J-r]-p[J-r-z]);else if(I==5)v=K+(p[J-r]-p[J-r-z]>>>1);else if(I==6)v=p[J-r]+(K-p[J-r-z]>>>1);
else if(I==7)v=K+p[J-r]>>>1;else throw I;p[J]=v+x(E[t],c)}}s+=r}}function f(p,r){return o(g(p,r),p)}function d(p,r,c){var z=y.length-D;
for(var G=0;G<z;G+=4){var I=y[D+G];y[D+G]=y[D+G+3];y[D+G+3]=I;var I=y[D+G+1];y[D+G+1]=y[D+G+2];y[D+G+2]=I}var E=e[0];
for(var t=0;t<H;t++){var u=32768,s=32768;for(var k=0;k<r;k+=2){var J=w(E,c),K=w(E,c);if(J!=0)u+=f(J,c);
if(K!=0)s+=f(K,c);p[t*r+k]=u&65535;p[t*r+k+1]=s&65535}}}function h(p){y=p;D=0;C=[],e=[];if(a()!=65496)throw"e";
while(!0){var r=a();if(r==65535){D--;continue}var c=a();if(r==65475){j=q();H=a();F=a();i=q();A=[];for(var z=0;
z<i;z++){var G=q(),I=q();if(I!=17)throw"e";var E=q();if(E!=0)throw"e";A[G]=z}}else if(r==65476){var t=D+c-2;
while(D<t)b()}else if(r==65498){D++;for(var z=0;z<i;z++){var u=q();e[A[u]]=C[q()>>>4]}l=q();D+=2;break}else{D+=c-2}}var s=j>8?Uint16Array:Uint8Array,k=F*i,J=new s(H*k),K={e:0,c:0,b:l==8,a:D,data:y,d:y.length};
if(K.b)d(J,k,K);else n(J,k,K);return J}return h}();


(function(){var O=0,d=1,n=2,F=3,w=4,j=5,C=6,l=7,k=8,P=9,a9=10,g=11,U=12,t=13,L=14,Y=15,Q=16,M=17,u=18;
function a4($){var z=UTIF._binBE.readUshort,v={m:z($,0),f:$[2],r:$[3],a:$[4],d:z($,5),t:z($,7),h:z($,9),n:z($,11),v:$[13],p:z($,14)};
if(v.m!=18771||v.f>1||v.d<6||v.d%6||v.h<768||v.h%24||v.n!=768||v.t<v.n||v.t%v.n||v.t-v.h>=v.n||v.v>16||v.v!=v.t/v.n||v.v!=Math.ceil(v.h/v.n)||v.p!=v.d/6||v.a!=12&&v.a!=14&&v.a!=16||v.r!=16&&v.r!=0){throw"Invalid data"}if(v.f==0){throw"Not implemented. We need this file!"}v.o=v.r==16;
v.c=(v.o?v.n*2/3:v.n>>>1)|0;v.g=v.c+2;v.q=64;v.j=(1<<v.a)-1;v.w=4*v.a;return v}function a6($,z){var v=new Array(z.v),i=16+4*z.v;
for(var y=0,A=16;y<z.v;A+=4){var B=UTIF._binBE.readUint($,A);v[y]=$.slice(i,i+B);v[y].l=0;v[y].s=0;i+=B;
y++}if(i!=$.length)throw"Invalid data";return v}function a7($,z){for(var v=-z[4],i=0;v<=z[4];i++,v++){$[i]=v<=-z[3]?-4:v<=-z[2]?-3:v<=-z[1]?-2:v<-z[0]?-1:v<=z[0]?0:v<z[1]?1:v<z[2]?2:v<z[3]?3:4}}function a3($,z,v){var i=[z,3*z+18,5*z+67,7*z+276,v];
$.k=z;$.i=(i[4]+2*z)/(2*z+1)+1|0;$.b=Math.ceil(Math.log2($.i));$.e=9;a7($.u,i)}function a1($){var z={u:new Int8Array(2<<$.a)};
a3(z,0,$.j);return z}function N($){var z=[[],[],[]],v=Math.max(2,$.i+32>>>6);for(var i=0;i<3;i++){for(var y=0;
y<41;y++){z[i][y]=[v,1]}}return z}function a8($){for(var z=-1,v=0;!v;z++){v=$[$.l]>>>7-$.s&1;$.s++;$.s&=7;
if(!$.s)$.l++}return z}function R($,z){var v=0,i=8-$.s,y=$.l,A=$.s;if(z){if(z>=i){do{v<<=i;z-=i;v|=$[$.l]&(1<<i)-1;
$.l++;i=8}while(z>=8)}if(z){v<<=z;i-=z;v|=$[$.l]>>>i&(1<<z)-1}$.s=8-i}return v}function a2($,z){var v=0;
if(z<$){while(v<=14&&z<<++v<$);}return v}function V($,z,v,i,y,A,B,r){if(r==null)r=0;var W=A+1,o=W%2,J=0,K=0,f=0,E,p,h=i[y],e=i[y-1],T=i[y-2][W],I=e[W-1],x=e[W],G=e[W+1],c=h[W-1],D=h[W+1],Z=Math.abs,H,s,X,q;
if(o){H=Z(G-x);s=Z(T-x);X=Z(I-x)}if(o){q=H>X&&s<H?T+I:H<X&&s<X?T+G:G+I;q=q+2*x>>>2;if(r){h[W]=q;return}E=z.e*z.u[$.j+x-T]+z.u[$.j+I-x]}else{q=x>I&&x>G||x<I&&x<G?D+c+2*x>>>2:c+D>>>1;
E=z.e*z.u[$.j+x-I]+z.u[$.j+I-c]}p=Z(E);var _=a8(v);if(_<$.w-z.b-1){var a=a2(B[p][0],B[p][1]);f=R(v,a)+(_<<a)}else{f=R(v,z.b)+1}f=f&1?-1-(f>>>1):f>>>1;
B[p][0]+=Z(f);if(B[p][1]==$.q){B[p][0]>>>=1;B[p][1]>>>=1}B[p][1]++;q=E<0?q-f:q+f;if($.f){if(q<0)q+=z.i;
else if(q>$.j)q-=z.i}h[W]=q>=0?Math.min(q,$.j):0}function S($,z,v){var i=$[0].length;for(var y=z;y<=v;
y++){$[y][0]=$[y-1][1];$[y][i-1]=$[y-1][i-2]}}function b($){S($,l,U);S($,n,w);S($,Y,M)}function m($,z,v,i,y,A,B,r,W,o,J,K,f){var E=0,p=1,h=y<t&&y>w;
while(p<$.c){if(E<$.c){V($,z,v,i,y,E,B[W],$.o&&(h&&o||!h&&(J||(E&K)==f)));V($,z,v,i,A,E,B[W],$.o&&(!h&&o||h&&(J||(E&K)==f)));
E+=2}if(E>8){V($,z,v,i,y,p,r[W]);V($,z,v,i,A,p,r[W]);p+=2}}b(i)}function a0($,z,v,i,y,A){m($,z,v,i,n,l,y,A,0,0,1,0,8);
m($,z,v,i,k,Y,y,A,1,0,1,0,8);m($,z,v,i,F,P,y,A,2,1,0,3,0);m($,z,v,i,a9,Q,y,A,0,0,0,3,2);m($,z,v,i,w,g,y,A,1,0,0,3,2);
m($,z,v,i,U,M,y,A,2,1,0,3,0)}function a5($,z,v,i,y,A){var B=A.length,r=$.n;if(y+1==$.v)r=$.h-y*$.n;var W=6*$.h*i+y*$.n;
for(var o=0;o<6;o++){for(var J=0;J<r;J++){var K=A[o%B][J%B],f;if(K==0){f=n+(o>>>1)}else if(K==2){f=Y+(o>>>1)}else{f=l+o}var E=$.o?(J*2/3&2147483646|J%3&1)+(J%3>>>1):J>>>1;
z[W+J]=v[f][E+1]}W+=$.h}}UTIF._decompressRAF=function($,z){var v=a4($),i=a6($,v),y=a1(v),A=new Int16Array(v.h*v.d);
if(z==null){z=v.o?[[1,1,0,1,1,2],[1,1,2,1,1,0],[2,0,1,0,2,1],[1,1,2,1,1,0],[1,1,0,1,1,2],[0,2,1,2,0,1]]:[[0,1],[3,2]]}var B=[[O,F],[d,w],[j,g],[C,U],[t,Q],[L,M]],r=[];
for(var W=0;W<u;W++){r[W]=new Uint16Array(v.g)}for(var o=0;o<v.v;o++){var J=N(y),K=N(y);for(var W=0;
W<u;W++){for(var f=0;f<v.g;f++){r[W][f]=0}}for(var E=0;E<v.p;E++){a0(v,y,i[o],r,J,K);for(var W=0;W<6;
W++){for(var f=0;f<v.g;f++){r[B[W][0]][f]=r[B[W][1]][f]}}a5(v,A,r,E,o,z);for(var W=n;W<u;W++){if([j,C,t,L].indexOf(W)==-1){for(var f=0;
f<v.g;f++){r[W][f]=0}}}b(r)}}return A}}())




})(UTIF, pako);
})();