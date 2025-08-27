
const state = {
  step: 0,
  billing: 'monthly',      // 'monthly' | 'yearly'
  plan: null,              // { name, monthly, yearly }
  addons: []               // [{name, monthly, yearly}]
};



const steps      = [...document.querySelectorAll('.step')];
const badges     = [...document.querySelectorAll('.step-badge')];

const planCards  = [...document.querySelectorAll('.plan-card')];
const billSwitch = document.getElementById('billSwitch');

const addonChecks = [...document.querySelectorAll('.addon-check')];

const sumPlanEl  = document.getElementById('sumPlan');
const sumPlanPriceEl = document.getElementById('sumPlanPrice');
const sumAddonsEl = document.getElementById('sumAddons');
const totalLabelEl = document.getElementById('totalLabel');
const totalValueEl = document.getElementById('totalValue');


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
  document.querySelector('.card').classList.toggle('yearly', yearly);
  document.querySelector('.card').classList.toggle('yearly-on', yearly);

  document.querySelector('.bill-label.monthly').classList.toggle('active', !yearly);
  document.querySelector('.bill-label.yearly').classList.toggle('active', yearly);

  planCards.forEach(card=>{
    const price = yearly ? card.dataset.yearly : card.dataset.monthly;
    card.querySelector('.price').textContent = money(price, state.billing);
  });

  addonChecks.forEach(chk=>{
    const price = yearly ? chk.dataset.yearly : chk.dataset.monthly;
    chk.closest('.addon').querySelector('.addon-price').textContent = `+${money(price, state.billing)}`;
  });
}

function updateSummary(){
  if(!state.plan) return;

  // Plan
  const planPrice = state.billing==='yearly' ? state.plan.yearly : state.plan.monthly;
  sumPlanEl.textContent = `${state.plan.name} (${state.billing==='yearly'?'Yearly':'Monthly'})`;
  sumPlanPriceEl.textContent = money(planPrice, state.billing);

  


  
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

  totalLabelEl.textContent = `Total (per ${state.billing==='yearly'?'year':'month'})`;
  totalValueEl.textContent = money(total, state.billing);
}



// ----- Step 1 -> Next -----
document.querySelectorAll('.btn.next').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    if(state.step===0){
      const name  = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const phone = document.getElementById('phone').value.trim();

      // Validate name
      if(!name){ alert('Please enter your name.'); return; }



      // Validate email with regex
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if(!emailPattern.test(email)){ 
        alert('Please enter a valid email address (must include @).'); 
        return; 
      }

      // Validate phone (11 digits only)
      const phonePattern = /^[0-9]{11}$/;
      if(!phonePattern.test(phone)){
        alert('Phone number must be 11 digits and contain only numbers.');
        return;
      }
    }

    if(state.step===1 && !state.plan){ 
      alert('Please select a plan.'); 
      return; 
    }

    if(state.step===2){
      updateSummary();
    }

    showStep(Math.min(state.step+1, steps.length-1));
  });
});

// ----- Go Back -----
document.querySelectorAll('.btn.prev').forEach(btn=>{
  btn.addEventListener('click', ()=> showStep(Math.max(state.step-1,0)));
});

// ----- Confirm -----
document.querySelector('.btn.confirm').addEventListener('click', ()=>{
  showStep(4); // show "thank you"
});

// ----- Billing switch -----
billSwitch.addEventListener('change', ()=>{
  state.billing = billSwitch.checked ? 'yearly' : 'monthly';
  refreshPlanPrices();
  if(state.step===3) updateSummary();
});
refreshPlanPrices();

// ----- Plan selection -----
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
    const foundIdx = state.addons.findIndex(a=>a.name===chk.dataset.name);
    if(chk.checked){
      if(foundIdx===-1){
        state.addons.push({
          name: chk.dataset.name,
          monthly: Number(chk.dataset.monthly),
          yearly: Number(chk.dataset.yearly)
        });
      }
    }else{
      if(foundIdx>-1) state.addons.splice(foundIdx,1);
    }
  });
});

// ----- Change plan link -----
document.getElementById('changePlan').addEventListener('click', ()=>{
  showStep(1);
});
