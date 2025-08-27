





const state = {
  step: 0,
  billing: 'monthly',      // 'monthly' | 'yearly'
  plan: null,              // { name, monthly, yearly }
  addons: []               // [{ name, monthly, yearly }]
};


const steps          = [...document.querySelectorAll('.step')];
const badges         = [...document.querySelectorAll('.step-badge')];

const planCards      = [...document.querySelectorAll('.plan-card')];
const billSwitch     = document.getElementById('billSwitch');

const addonChecks    = [...document.querySelectorAll('.addon-check')];

const sumPlanEl      = document.getElementById('sumPlan');
const sumPlanPriceEl = document.getElementById('sumPlanPrice');
const sumAddonsEl    = document.getElementById('sumAddons');
const totalLabelEl   = document.getElementById('totalLabel');
const totalValueEl   = document.getElementById('totalValue');

const nextBtns       = [...document.querySelectorAll('.btn.next')];
const prevBtns       = [...document.querySelectorAll('.btn.prev')];
const confirmBtn     = document.querySelector('.btn.confirm');





const nameInput   = document.getElementById('name');
const emailInput  = document.getElementById('email');
const phoneInput  = document.getElementById('phone');
const emailError  = document.getElementById('emailError'); 



function showStep(i){
  state.step = i;
  steps.forEach((s,idx)=> s.classList.toggle('active', idx===i));
  badges.forEach((b,idx)=> b.classList.toggle('active', idx===i));
}

function money(n, cycle){
  return `$${n}/${cycle==='yearly'?'yr':'mo'}`;
}

function refreshPlanPrices(){
  const yearly = state.billing==='yearly';
  const card = document.querySelector('.card');
  if (card){
    card.classList.toggle('yearly', yearly);
    card.classList.toggle('yearly-on', yearly);
  }

  const monthlyLbl = document.querySelector('.bill-label.monthly');
  const yearlyLbl  = document.querySelector('.bill-label.yearly');
  if (monthlyLbl && yearlyLbl){
    monthlyLbl.classList.toggle('active', !yearly);
    yearlyLbl.classList.toggle('active', yearly);
  }

  planCards.forEach(card=>{
    const price = yearly ? card.dataset.yearly : card.dataset.monthly;
    const priceEl = card.querySelector('.price');
    if (priceEl) priceEl.textContent = money(price, state.billing);
  });

  addonChecks.forEach(chk=>{
    const price = yearly ? chk.dataset.yearly : chk.dataset.monthly;
    const priceEl = chk.closest('.addon')?.querySelector('.addon-price');
    if (priceEl) priceEl.textContent = `+${money(price, state.billing)}`;
  });
}

function updateSummary(){
  if(!state.plan) return;

  const planPrice = state.billing==='yearly' ? state.plan.yearly : state.plan.monthly;
  if (sumPlanEl)      sumPlanEl.textContent      = `${state.plan.name} (${state.billing==='yearly'?'Yearly':'Monthly'})`;
  if (sumPlanPriceEl) sumPlanPriceEl.textContent = money(planPrice, state.billing);

  if (sumAddonsEl){
    sumAddonsEl.innerHTML = '';
    let total = Number(planPrice);

    state.addons.forEach(a=>{
      const p = state.billing==='yearly' ? a.yearly : a.monthly;
      total += Number(p);
      const row = document.createElement('div');
      row.className = 'row';
      row.innerHTML = `<span>${a.name}</span><span>+${money(p, state.billing)}</span>`;
      sumAddonsEl.appendChild(row);
    });

    if (totalLabelEl) totalLabelEl.textContent = `Total (per ${state.billing==='yearly'?'year':'month'})`;
    if (totalValueEl) totalValueEl.textContent = money(total, state.billing);
  }
}

// Strict email validation (must include @ and a domain)
function isValidEmail(value){

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validateStep1(){
  const name  = (nameInput?.value || '').trim();
  const email = (emailInput?.value || '').trim();
  const phone = (phoneInput?.value || '').trim();

  if (!name || !email || !phone){
    alert('Please fill in all fields.');
    return false;
  }

  // Must include @ and valid 
  if (!isValidEmail(email)){
    if (emailError) emailError.style.display = 'block';
    
    emailInput?.focus();
    return false;
  } else {
    if (emailError) emailError.style.display = 'none';
  }

  return true;
}





nextBtns.forEach(btn=>{
  btn.addEventListener('click', (e)=>{
    e.preventDefault(); 

    // Step-specific gates
    if (state.step === 0){
      if (!validateStep1()) return;  //  stop if email invalid or fields empty
    }
    if (state.step === 1 && !state.plan){
      alert('Please select a plan.');
      return;
    }
    if (state.step === 2){
      updateSummary();
    }

    showStep(Math.min(state.step+1, steps.length-1));
  });
});



prevBtns.forEach(btn=>{
  btn.addEventListener('click', (e)=>{
    e.preventDefault();
    showStep(Math.max(state.step-1, 0));
  });
});



if (confirmBtn){
  confirmBtn.addEventListener('click', (e)=>{
    e.preventDefault();



    showStep(4);
  });
}

// Billing switch
if (billSwitch){
  billSwitch.addEventListener('change', ()=>{
    state.billing = billSwitch.checked ? 'yearly' : 'monthly';
    refreshPlanPrices();
    if (state.step===3) updateSummary();
  });
}
refreshPlanPrices();



planCards.forEach(card=>{
  card.addEventListener('click', ()=>{
    planCards.forEach(c=>c.classList.remove('active'));
    card.classList.add('active');
    state.plan = {
      name: card.dataset.plan,
      monthly: Number(card.dataset.monthly),
      yearly: Number(card.dataset.yearly)
    };
  });
});


addonChecks.forEach(chk=>{
  chk.addEventListener('change', ()=>{
    const idx = state.addons.findIndex(a=>a.name===chk.dataset.name);
    if(chk.checked){
      if(idx===-1){
        state.addons.push({
          name: chk.dataset.name,
          monthly: Number(chk.dataset.monthly),
          yearly: Number(chk.dataset.yearly)
        });
      }
    }else{
      if(idx>-1) state.addons.splice(idx,1);
    }
  });
});


if (emailInput){
  emailInput.addEventListener('input', ()=>{
    if (emailError) emailError.style.display = isValidEmail(emailInput.value.trim()) ? 'none' : 'block';
  });
}

