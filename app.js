// ========== CLOCK ==========
function updateClock(){
  const n=new Date(),h=n.getHours(),m=n.getMinutes(),s=n.getSeconds();
  const ap=h>=12?'PM':'AM',hh=h%12||12;
  document.getElementById('clock').textContent=`${String(hh).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')} ${ap}`;
}
setInterval(updateClock,1000);updateClock();

// ========== THEME ==========
document.getElementById('themeToggle').addEventListener('change',function(){
  document.body.classList.toggle('light',!this.checked);
});

// ========== SHOW CALCULATOR ==========
const calcNames={stockAvg:'Stock Average Calculator',profitLoss:'Profit / Loss Calculator',sip:'SIP Calculator',percentage:'Percentage Calculator',emi:'EMI Calculator',cagr:'CAGR Calculator',swp:'SWP Calculator',stockSplit:'Stock Split Calculator',bonusShare:'Bonus Share Calculator',lumpsum:'Lumpsum Calculator',rule72:'Rule of 72 Calculator',dividend:'Dividend Calculator',bonusBuyback:'Bonus & Buyback',faceValue:'Face Value Split',stockScore:'Stock Score AI',holidays:'Trading Holidays',books:'Best Books',history:'Calculation History'};

function showCalc(id,el){
  document.querySelectorAll('.calc-section').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('#mainNav li, #favList li').forEach(l=>l.classList.remove('active'));
  document.getElementById('calc-'+id).classList.add('active');
  document.querySelectorAll('[data-id="'+id+'"]').forEach(l=>l.classList.add('active'));
  document.getElementById('currentCalcName').textContent=calcNames[id]||id;
}

// ========== SEARCH ==========
function filterNav(q){
  const v=q.toLowerCase();
  document.querySelectorAll('#mainNav li').forEach(li=>{
    li.style.display=li.textContent.toLowerCase().includes(v)?'flex':'none';
  });
}

// ========== FAVOURITES ==========
let favs=JSON.parse(localStorage.getItem('stockcalc_favs')||'[]');
function toggleFav(id,e){
  e.stopPropagation();
  if(favs.includes(id))favs=favs.filter(f=>f!==id);
  else favs.push(id);
  localStorage.setItem('stockcalc_favs',JSON.stringify(favs));
  renderFavs();
  showToast(favs.includes(id)?'Added to favourites ⭐':'Removed from favourites');
}
function renderFavs(){
  const fl=document.getElementById('favList');
  const fg=document.getElementById('favGroup');
  fl.innerHTML='';
  if(favs.length===0){fg.style.display='none';return;}
  fg.style.display='block';
  favs.forEach(id=>{
    const li=document.createElement('li');
    li.dataset.id=id;li.className='active';
    li.innerHTML=`<span class="nav-icon"><i class="fas fa-star" style="color:var(--yellow)"></i></span><span class="nav-label">${calcNames[id]}</span>`;
    li.onclick=()=>showCalc(id,li);
    fl.appendChild(li);
  });
  document.querySelectorAll('.fav-btn').forEach(btn=>{
    const id=btn.closest('li').dataset.id;
    if(favs.includes(id)){btn.classList.add('active');btn.innerHTML='<i class="fas fa-star"></i>';}
    else{btn.classList.remove('active');btn.innerHTML='<i class="far fa-star"></i>';}
  });
}
renderFavs();

// ========== TOAST ==========
function showToast(msg){
  const t=document.getElementById('toast');
  t.textContent=msg;t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),2500);
}

// ========== HISTORY ==========
let history=JSON.parse(localStorage.getItem('stockcalc_history')||'[]');
function addHistory(calc,result){
  const now=new Date();
  history.unshift({calc,result,time:now.toLocaleTimeString()});
  if(history.length>50)history=history.slice(0,50);
  localStorage.setItem('stockcalc_history',JSON.stringify(history));
  renderHistory();
}
function renderHistory(){
  const el=document.getElementById('historyList');
  if(history.length===0){el.innerHTML='<div class="empty-history"><i class="fas fa-inbox"></i><p>No calculations yet.</p></div>';return;}
  el.innerHTML=history.map(h=>`
    <div class="history-item">
      <div class="h-info">
        <div class="h-calc">${calcNames[h.calc]||h.calc}</div>
        <div class="h-result">${h.result}</div>
      </div>
      <div class="h-time">${h.time}</div>
    </div>`).join('');
}
function clearHistory(){
  history=[];localStorage.removeItem('stockcalc_history');renderHistory();showToast('History cleared');
}
renderHistory();

// ========== FORMAT CURRENCY ==========
function fmt(n){return new Intl.NumberFormat('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2}).format(n);}
function fmtInt(n){return new Intl.NumberFormat('en-IN').format(Math.round(n));}

// ========== RESULT BUILDER ==========
function showResult(cardId,html){
  const el=document.getElementById('res-'+cardId);
  el.innerHTML=html;el.style.borderColor='rgba(0,212,170,0.3)';
  setTimeout(()=>el.style.borderColor='',2000);
}

// ========== CLEAR ==========
function clearCalc(id){
  document.querySelectorAll('#calc-'+id+' input').forEach(i=>i.value='');
  const el=document.getElementById('res-'+id);
  if(el)el.innerHTML='<div class="result-placeholder"><i class="fas fa-chart-pie"></i><p>Enter values and click Calculate</p></div>';
}

// ========== EXPORT PDF ==========
function exportPDF(id){
  const sec=document.getElementById('calc-'+id);
  const res=document.getElementById('res-'+id);
  if(!res||res.querySelector('.result-placeholder')){showToast('⚠️ Please calculate first!');return;}
  const w=window.open('','_blank');
  w.document.write(`<!DOCTYPE html><html><head><title>${calcNames[id]}</title>
  <style>body{font-family:sans-serif;padding:30px;max-width:600px;margin:0 auto;}
  h2{color:#00d4aa;margin-bottom:20px;} .result-row{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #eee;}
  .label{color:#666;} .value{font-weight:700;} footer{margin-top:30px;font-size:11px;color:#999;text-align:center;}</style></head>
  <body><h2>${calcNames[id]}</h2><p>Generated on ${new Date().toLocaleString()}</p><hr/>
  ${res.innerHTML}<footer>STOCK-CALC Pro — For educational purposes only</footer>
  <script>window.onload=()=>window.print();<\/script></body></html>`);
  w.document.close();
  showToast('📄 Opening PDF export...');
}

// ========== CALCULATORS ==========

// 1. Stock Average
let stockRowCount=2;
function addStockRow(){
  stockRowCount++;
  const d=document.createElement('div');d.className='input-row';
  d.innerHTML=`<div class="input-group"><label>Buy ${stockRowCount} Price (₹)</label><input type="number" class="buy-price" placeholder="0.00"/></div>
               <div class="input-group"><label>Quantity</label><input type="number" class="buy-qty" placeholder="0"/></div>`;
  document.getElementById('stockAvgRows').appendChild(d);
}
function calcStockAvg(){
  const prices=[...document.querySelectorAll('.buy-price')].map(i=>parseFloat(i.value)||0);
  const qtys=[...document.querySelectorAll('.buy-qty')].map(i=>parseFloat(i.value)||0);
  let totalInv=0,totalQty=0;
  prices.forEach((p,i)=>{totalInv+=p*qtys[i];totalQty+=qtys[i];});
  if(!totalQty){showToast('⚠️ Enter at least one price & quantity');return;}
  const avg=totalInv/totalQty;
  const res=`Average: ₹${fmt(avg)} | Invested: ₹${fmt(totalInv)} | Qty: ${fmtInt(totalQty)}`;
  showResult('stockAvg',`
    <div class="result-title">Average Purchase Price</div>
    <div class="result-main">₹${fmt(avg)}</div>
    <div class="result-sub">per share</div>
    <div style="margin-top:16px">
      <div class="result-row"><span class="label">Total Investment</span><span class="value">₹${fmt(totalInv)}</span></div>
      <div class="result-row"><span class="label">Total Quantity</span><span class="value">${fmtInt(totalQty)} shares</span></div>
      <div class="result-row"><span class="label">Avg Cost Per Share</span><span class="value up">₹${fmt(avg)}</span></div>
    </div>`);
  addHistory('stockAvg',res);
}

// 2. Profit/Loss
function calcPL(){
  const b=parseFloat(document.getElementById('plBuy').value)||0;
  const s=parseFloat(document.getElementById('plSell').value)||0;
  const q=parseFloat(document.getElementById('plQty').value)||0;
  const br=parseFloat(document.getElementById('plBrokerage').value)||0;
  if(!b||!s||!q){showToast('⚠️ Enter buy price, sell price & quantity');return;}
  const gross=(s-b)*q;
  const brokerage=(b*q+s*q)*br/100;
  const net=gross-brokerage;
  const pct=((s-b)/b*100).toFixed(2);
  const isProfit=net>=0;
  const res=`${isProfit?'Profit':'Loss'}: ₹${fmt(Math.abs(net))} (${pct}%)`;
  showResult('profitLoss',`
    <div class="result-title">${isProfit?'🟢 Profit':'🔴 Loss'}</div>
    <div class="result-main" style="color:${isProfit?'var(--green)':'var(--red)'}">₹${fmt(Math.abs(net))}</div>
    <div class="result-sub">${pct}% ${isProfit?'gain':'loss'}</div>
    <div style="margin-top:16px">
      <div class="result-row"><span class="label">Gross P&L</span><span class="value ${isProfit?'up':'down'}">₹${fmt(Math.abs(gross))}</span></div>
      <div class="result-row"><span class="label">Brokerage</span><span class="value down">₹${fmt(brokerage)}</span></div>
      <div class="result-row"><span class="label">Net P&L</span><span class="value ${isProfit?'up':'down'}">₹${fmt(Math.abs(net))}</span></div>
      <div class="result-row"><span class="label">Buy Value</span><span class="value">₹${fmt(b*q)}</span></div>
      <div class="result-row"><span class="label">Sell Value</span><span class="value">₹${fmt(s*q)}</span></div>
    </div>`);
  addHistory('profitLoss',res);
}

// 3. SIP
function calcSIP(){
  const p=parseFloat(document.getElementById('sipAmt').value)||0;
  const r=(parseFloat(document.getElementById('sipRate').value)||0)/12/100;
  const n=(parseFloat(document.getElementById('sipYrs').value)||0)*12;
  if(!p||!r||!n){showToast('⚠️ Fill all fields');return;}
  const m=p*((Math.pow(1+r,n)-1)/r)*(1+r);
  const invested=p*n;
  const returns=m-invested;
  const res=`SIP Maturity: ₹${fmt(m)} | Invested: ₹${fmt(invested)} | Returns: ₹${fmt(returns)}`;
  showResult('sip',`
    <div class="result-title">Maturity Amount</div>
    <div class="result-main">₹${fmt(m)}</div>
    <div style="margin-top:16px">
      <div class="result-row"><span class="label">Total Invested</span><span class="value">₹${fmt(invested)}</span></div>
      <div class="result-row"><span class="label">Total Returns</span><span class="value up">₹${fmt(returns)}</span></div>
      <div class="result-row"><span class="label">Wealth Gained</span><span class="value up">${((returns/invested)*100).toFixed(1)}%</span></div>
      <div class="result-row"><span class="label">Monthly Investment</span><span class="value">₹${fmt(p)}</span></div>
    </div>`);
  addHistory('sip',res);
}

// 4. Percentage
function calcPerc(){
  const v=parseFloat(document.getElementById('percVal').value)||0;
  const p=parseFloat(document.getElementById('percPct').value)||0;
  if(!v||!p){showToast('⚠️ Enter value and percentage');return;}
  const r=v*p/100;
  const res=`${p}% of ₹${fmt(v)} = ₹${fmt(r)}`;
  showResult('percentage',`
    <div class="result-title">Result</div>
    <div class="result-main">₹${fmt(r)}</div>
    <div class="result-sub">${p}% of ${fmt(v)}</div>
    <div style="margin-top:16px">
      <div class="result-row"><span class="label">Original Value</span><span class="value">₹${fmt(v)}</span></div>
      <div class="result-row"><span class="label">Percentage</span><span class="value">${p}%</span></div>
      <div class="result-row"><span class="label">Result Amount</span><span class="value up">₹${fmt(r)}</span></div>
      <div class="result-row"><span class="label">Remaining</span><span class="value">₹${fmt(v-r)}</span></div>
    </div>`);
  addHistory('percentage',res);
}

// 5. EMI
function calcEMI(){
  const p=parseFloat(document.getElementById('emiLoan').value)||0;
  const r=(parseFloat(document.getElementById('emiRate').value)||0)/12/100;
  const n=parseFloat(document.getElementById('emiMonths').value)||0;
  if(!p||!r||!n){showToast('⚠️ Fill all fields');return;}
  const emi=p*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1);
  const total=emi*n;
  const interest=total-p;
  const res=`EMI: ₹${fmt(emi)} | Total: ₹${fmt(total)} | Interest: ₹${fmt(interest)}`;
  showResult('emi',`
    <div class="result-title">Monthly EMI</div>
    <div class="result-main">₹${fmt(emi)}</div>
    <div style="margin-top:16px">
      <div class="result-row"><span class="label">Principal</span><span class="value">₹${fmt(p)}</span></div>
      <div class="result-row"><span class="label">Total Interest</span><span class="value down">₹${fmt(interest)}</span></div>
      <div class="result-row"><span class="label">Total Amount</span><span class="value">₹${fmt(total)}</span></div>
      <div class="result-row"><span class="label">Interest %</span><span class="value down">${((interest/p)*100).toFixed(1)}%</span></div>
    </div>`);
  addHistory('emi',res);
}

// 6. CAGR
function calcCAGR(){
  const iv=parseFloat(document.getElementById('cagrInit').value)||0;
  const fv=parseFloat(document.getElementById('cagrFinal').value)||0;
  const y=parseFloat(document.getElementById('cagrYrs').value)||0;
  if(!iv||!fv||!y){showToast('⚠️ Fill all fields');return;}
  const cagr=(Math.pow(fv/iv,1/y)-1)*100;
  const growth=fv-iv;
  const res=`CAGR: ${cagr.toFixed(2)}% | Growth: ₹${fmt(growth)}`;
  showResult('cagr',`
    <div class="result-title">CAGR</div>
    <div class="result-main">${cagr.toFixed(2)}%</div>
    <div class="result-sub">per annum</div>
    <div style="margin-top:16px">
      <div class="result-row"><span class="label">Initial Value</span><span class="value">₹${fmt(iv)}</span></div>
      <div class="result-row"><span class="label">Final Value</span><span class="value">₹${fmt(fv)}</span></div>
      <div class="result-row"><span class="label">Total Growth</span><span class="value up">₹${fmt(growth)}</span></div>
      <div class="result-row"><span class="label">Growth %</span><span class="value up">${((growth/iv)*100).toFixed(1)}%</span></div>
    </div>`);
  addHistory('cagr',res);
}

// 7. SWP
function calcSWP(){
  let corpus=parseFloat(document.getElementById('swpInv').value)||0;
  const w=parseFloat(document.getElementById('swpWith').value)||0;
  const r=(parseFloat(document.getElementById('swpRate').value)||0)/12/100;
  const n=(parseFloat(document.getElementById('swpYrs').value)||0)*12;
  if(!corpus||!w||!n){showToast('⚠️ Fill all fields');return;}
  const init=corpus;
  let months=0;
  for(let i=0;i<n;i++){corpus=corpus*(1+r)-w;if(corpus<=0){corpus=0;months=i+1;break;}months=i+1;}
  const totalWithdrawn=w*months;
  const res=`Final Corpus: ₹${fmt(corpus)} | Withdrawn: ₹${fmt(totalWithdrawn)}`;
  showResult('swp',`
    <div class="result-title">Final Corpus</div>
    <div class="result-main" style="color:${corpus>0?'var(--accent)':'var(--red)'}">₹${fmt(corpus)}</div>
    <div class="result-sub">${corpus>0?'Corpus remaining after '+Math.floor(months/12)+' yrs':'Corpus depleted at '+months+' months'}</div>
    <div style="margin-top:16px">
      <div class="result-row"><span class="label">Initial Investment</span><span class="value">₹${fmt(init)}</span></div>
      <div class="result-row"><span class="label">Total Withdrawn</span><span class="value up">₹${fmt(totalWithdrawn)}</span></div>
      <div class="result-row"><span class="label">Monthly Withdrawal</span><span class="value">₹${fmt(w)}</span></div>
    </div>`);
  addHistory('swp',res);
}

// 8. Stock Split
function calcSplit(){
  const p=parseFloat(document.getElementById('spPrice').value)||0;
  const s=parseFloat(document.getElementById('spShares').value)||0;
  const r=parseFloat(document.getElementById('spRatio').value)||1;
  if(!p||!s||!r){showToast('⚠️ Fill all fields');return;}
  const np=p/r,ns=s*r;
  const res=`New Price: ₹${fmt(np)} | New Shares: ${fmtInt(ns)}`;
  showResult('stockSplit',`
    <div class="result-title">After Split (${r}:1)</div>
    <div class="result-main">₹${fmt(np)}</div>
    <div class="result-sub">new price per share</div>
    <div style="margin-top:16px">
      <div class="result-row"><span class="label">Old Price</span><span class="value">₹${fmt(p)}</span></div>
      <div class="result-row"><span class="label">New Price</span><span class="value up">₹${fmt(np)}</span></div>
      <div class="result-row"><span class="label">Old Shares</span><span class="value">${fmtInt(s)}</span></div>
      <div class="result-row"><span class="label">New Shares</span><span class="value up">${fmtInt(ns)}</span></div>
      <div class="result-row"><span class="label">Total Value (same)</span><span class="value">₹${fmt(p*s)}</span></div>
    </div>`);
  addHistory('stockSplit',res);
}

// 9. Bonus Share
function calcBonus(){
  const s=parseFloat(document.getElementById('bsShares').value)||0;
  const r=parseFloat(document.getElementById('bsRatio').value)||0;
  const p=parseFloat(document.getElementById('bsPrice').value)||0;
  if(!s||!r){showToast('⚠️ Fill shares and ratio');return;}
  const bonus=Math.floor(s*r);
  const total=s+bonus;
  const newP=p?p*s/total:0;
  const res=`Bonus: ${fmtInt(bonus)} shares | Total: ${fmtInt(total)} shares`;
  showResult('bonusShare',`
    <div class="result-title">Bonus Shares Received</div>
    <div class="result-main">${fmtInt(bonus)}</div>
    <div class="result-sub">free bonus shares</div>
    <div style="margin-top:16px">
      <div class="result-row"><span class="label">Shares Held</span><span class="value">${fmtInt(s)}</span></div>
      <div class="result-row"><span class="label">Bonus Shares</span><span class="value up">${fmtInt(bonus)}</span></div>
      <div class="result-row"><span class="label">Total Shares</span><span class="value up">${fmtInt(total)}</span></div>
      ${p?`<div class="result-row"><span class="label">Adjusted Price</span><span class="value">₹${fmt(newP)}</span></div>`:''}
    </div>`);
  addHistory('bonusShare',res);
}

// 10. Lumpsum
function calcLumpsum(){
  const p=parseFloat(document.getElementById('lsAmt').value)||0;
  const r=(parseFloat(document.getElementById('lsRate').value)||0)/100;
  const n=parseFloat(document.getElementById('lsYrs').value)||0;
  if(!p||!r||!n){showToast('⚠️ Fill all fields');return;}
  const a=p*Math.pow(1+r,n);
  const profit=a-p;
  const res=`Maturity: ₹${fmt(a)} | Profit: ₹${fmt(profit)}`;
  showResult('lumpsum',`
    <div class="result-title">Maturity Amount</div>
    <div class="result-main">₹${fmt(a)}</div>
    <div style="margin-top:16px">
      <div class="result-row"><span class="label">Invested</span><span class="value">₹${fmt(p)}</span></div>
      <div class="result-row"><span class="label">Profit</span><span class="value up">₹${fmt(profit)}</span></div>
      <div class="result-row"><span class="label">Return %</span><span class="value up">${((profit/p)*100).toFixed(1)}%</span></div>
      <div class="result-row"><span class="label">Multiplier</span><span class="value up">${(a/p).toFixed(2)}x</span></div>
    </div>`);
  addHistory('lumpsum',res);
}

// 11. Rule of 72
function calcRule72(){
  const r=parseFloat(document.getElementById('r72Rate').value)||0;
  if(!r){showToast('⚠️ Enter a rate');return;}
  const y=(72/r).toFixed(1);
  const res=`Years to double at ${r}%: ${y} years`;
  showResult('rule72',`
    <div class="result-title">Years to Double Money</div>
    <div class="result-main">${y} years</div>
    <div class="result-sub">at ${r}% annual return</div>
    <div style="margin-top:16px">
      <div class="result-row"><span class="label">Annual Return</span><span class="value">${r}%</span></div>
      <div class="result-row"><span class="label">Doubling Time</span><span class="value up">${y} years</span></div>
      <div class="result-row"><span class="label">At 12% (Nifty avg)</span><span class="value">6 years</span></div>
      <div class="result-row"><span class="label">At 15% (good MF)</span><span class="value">4.8 years</span></div>
    </div>`);
  addHistory('rule72',res);
}

// 12. Dividend
function calcDiv(){
  const s=parseFloat(document.getElementById('divShares').value)||0;
  const d=parseFloat(document.getElementById('divAmt').value)||0;
  const b=parseFloat(document.getElementById('divBuy').value)||0;
  if(!s||!d){showToast('⚠️ Enter shares and dividend');return;}
  const total=s*d;
  const yield_=b?((d/b)*100).toFixed(2):0;
  const res=`Total Dividend: ₹${fmt(total)} | Yield: ${yield_}%`;
  showResult('dividend',`
    <div class="result-title">Total Dividend Income</div>
    <div class="result-main">₹${fmt(total)}</div>
    <div style="margin-top:16px">
      <div class="result-row"><span class="label">Shares Held</span><span class="value">${fmtInt(s)}</span></div>
      <div class="result-row"><span class="label">Dividend / Share</span><span class="value">₹${fmt(d)}</span></div>
      <div class="result-row"><span class="label">Total Dividend</span><span class="value up">₹${fmt(total)}</span></div>
      ${b?`<div class="result-row"><span class="label">Dividend Yield</span><span class="value up">${yield_}%</span></div>`:''}
    </div>`);
  addHistory('dividend',res);
}

// 13. Buyback
function calcBuyback(){
  const s=parseFloat(document.getElementById('bbShares').value)||0;
  const p=parseFloat(document.getElementById('bbPrice').value)||0;
  const r=parseFloat(document.getElementById('bbRatio').value)||0;
  if(!s||!p||!r){showToast('⚠️ Fill all fields');return;}
  const eligible=Math.floor(s*r/10);
  const amt=eligible*p;
  const res=`Eligible: ${eligible} shares | Amount: ₹${fmt(amt)}`;
  showResult('bonusBuyback',`
    <div class="result-title">Buyback Earnings</div>
    <div class="result-main">₹${fmt(amt)}</div>
    <div style="margin-top:16px">
      <div class="result-row"><span class="label">Shares Held</span><span class="value">${fmtInt(s)}</span></div>
      <div class="result-row"><span class="label">Eligible Shares</span><span class="value up">${eligible}</span></div>
      <div class="result-row"><span class="label">Buyback Price</span><span class="value">₹${fmt(p)}</span></div>
      <div class="result-row"><span class="label">Total Amount</span><span class="value up">₹${fmt(amt)}</span></div>
    </div>`);
  addHistory('bonusBuyback',res);
}

// 14. Face Value
function calcFV(){
  const cf=parseFloat(document.getElementById('fvCurr').value)||1;
  const nf=parseFloat(document.getElementById('fvNew').value)||1;
  const s=parseFloat(document.getElementById('fvShares').value)||0;
  const p=parseFloat(document.getElementById('fvPrice').value)||0;
  if(!s){showToast('⚠️ Fill all fields');return;}
  const ratio=cf/nf;
  const ns=s*ratio,np=p/ratio;
  const res=`New Shares: ${fmtInt(ns)} | New Price: ₹${fmt(np)}`;
  showResult('faceValue',`
    <div class="result-title">After Face Value Split</div>
    <div class="result-main">${fmtInt(ns)} shares</div>
    <div style="margin-top:16px">
      <div class="result-row"><span class="label">Split Ratio</span><span class="value">${ratio}:1</span></div>
      <div class="result-row"><span class="label">Old Shares</span><span class="value">${fmtInt(s)}</span></div>
      <div class="result-row"><span class="label">New Shares</span><span class="value up">${fmtInt(ns)}</span></div>
      ${p?`<div class="result-row"><span class="label">New Price</span><span class="value">₹${fmt(np)}</span></div>`:''}
      ${p?`<div class="result-row"><span class="label">Total Value (unchanged)</span><span class="value">₹${fmt(s*p)}</span></div>`:''}
    </div>`);
  addHistory('faceValue',res);
}

// 15. AI Stock
function calcAI(){
  const stock=document.getElementById('aiStock').value.trim().toUpperCase();
  if(!stock){showToast('⚠️ Enter a stock name');return;}
  showResult('stockScore',`<div class="result-placeholder"><i class="fas fa-spinner fa-spin"></i><p>Analyzing ${stock}...</p></div>`);
  setTimeout(()=>{
    const score=Math.floor(Math.random()*25)+65;
    const fund=Math.floor(Math.random()*30)+60;
    const tech=Math.floor(Math.random()*30)+55;
    const sent=Math.floor(Math.random()*30)+60;
    const rating=score>=80?'Strong Buy':score>=70?'Buy':score>=60?'Hold':'Review';
    const col=score>=80?'var(--green)':score>=70?'var(--accent)':score>=60?'var(--yellow)':'var(--red)';
    showResult('stockScore',`
      <div class="result-title">AI Score — ${stock}</div>
      <div class="result-main" style="color:${col}">${score}/100</div>
      <div class="result-sub" style="color:${col};font-weight:700">${rating}</div>
      <div style="margin-top:16px">
        <div class="result-row"><span class="label">Fundamental Score</span><span class="value">${fund}/100</span></div>
        <div class="result-row"><span class="label">Technical Score</span><span class="value">${tech}/100</span></div>
        <div class="result-row"><span class="label">Sentiment Score</span><span class="value">${sent}/100</span></div>
        <div class="result-row"><span class="label">Overall Rating</span><span class="value" style="color:${col}">${rating}</span></div>
      </div>
      <p style="font-size:0.7rem;color:var(--muted);margin-top:10px">⚠️ Educational only. Not financial advice.</p>`);
    addHistory('stockScore',`${stock}: ${score}/100 — ${rating}`);
  },1500);
}
