let isTaxMode = false;

// 画面の切り替え機能
function toggleAppMode() {
    isTaxMode = !isTaxMode;
    const btn = document.getElementById('modeToggleBtn');
    
    // 各シートを取得
    const sheetBank = document.getElementById('sheet-bank-select');
    const sheetExp = document.getElementById('sheet-expenses');
    const sheetSim = document.getElementById('sheet-simulation');
    const sheetTax = document.getElementById('sheet-tax');
    
    if (isTaxMode) {
        // 固都税モードにする
        if(sheetBank) sheetBank.classList.add('hidden');
        if(sheetExp) sheetExp.classList.add('hidden');
        if(sheetSim) sheetSim.classList.add('hidden');
        if(sheetTax) {
            sheetTax.classList.remove('hidden');
            sheetTax.classList.add('flex'); 
        }
        
        btn.innerHTML = '<i class="fas fa-file-invoice-dollar md:mr-2"></i> <span class="hidden md:inline">資金計画へ戻る</span>';
        btn.classList.replace('bg-indigo-600', 'bg-gray-600');
        btn.classList.replace('hover:bg-indigo-500', 'hover:bg-gray-500');
    } else {
        // 資金計画モードに戻す
        if(sheetBank) sheetBank.classList.remove('hidden');
        if(sheetExp) sheetExp.classList.remove('hidden');
        if(sheetSim) sheetSim.classList.remove('hidden');
        if(sheetTax) {
            sheetTax.classList.add('hidden');
            sheetTax.classList.remove('flex');
        }
        
        btn.innerHTML = '<i class="fas fa-exchange-alt md:mr-2"></i> <span class="hidden md:inline">固都税へ切替</span>';
        btn.classList.replace('bg-gray-600', 'bg-indigo-600');
        btn.classList.replace('hover:bg-gray-500', 'hover:bg-indigo-500');
    }
}

// 買主/売主の強調表示切り替え
function toggleHighlight() {
    const modeEl = document.querySelector('input[name="highlightMode"]:checked');
    if(!modeEl) return;
    const mode = modeEl.value;
    const container = document.getElementById('resultArea');
    
    if(mode === 'seller') {
        container.classList.add('highlight-seller');
        container.classList.remove('highlight-buyer');
    } else {
        container.classList.add('highlight-buyer');
        container.classList.remove('highlight-seller');
    }
}

// 行の追加
function addTaxRow(type = 'land', name = '', taxStd1 = 0, taxStd2 = 0, shareN = 1, shareD = 1) {
    const tbody = document.getElementById('taxTableBody');
    if(!tbody) return;
    
    const tr1 = document.createElement('tr');
    const tdType = document.createElement('td');
    tdType.rowSpan = 2; tdType.className = "row-group-border align-top bg-white";
    const selectType = document.createElement('select');
    selectType.className = "text-center text-xs text-gray-700 cursor-pointer hover:bg-gray-50 rounded w-full";
    const options =[
        { val: "land", text: "土地" }, { val: "building", text: "建物" },
        { val: "common", text: "共用部分" }, { val: "storage", text: "物置" }, { val: "other", text: "その他" }
    ];
    options.forEach(opt => {
        const el = document.createElement('option');
        el.value = opt.val; el.textContent = opt.text; selectType.appendChild(el);
    });
    selectType.value = type; tdType.appendChild(selectType);
    
    const tdName = document.createElement('td');
    tdName.rowSpan = 2; tdName.className = "row-group-border align-top bg-white";
    const inputName = document.createElement('input');
    inputName.type = "text"; inputName.className = "text-left text-xs w-full"; inputName.placeholder = "所在・家屋番号"; inputName.value = name;
    tdName.appendChild(inputName);

    const tdLabel1 = document.createElement('td'); tdLabel1.className = "text-center text-xs text-gray-500 bg-gray-50"; tdLabel1.innerText = "固定";
    const tdTaxStd1 = document.createElement('td');
    const inputTaxStd1 = document.createElement('input');
    inputTaxStd1.type = "text"; inputTaxStd1.className = "currency text-gray-700 font-bold tax-std"; 
    inputTaxStd1.value = taxStd1.toLocaleString();
    inputTaxStd1.onfocus = function() { removeFormat(this); };
    inputTaxStd1.oninput = function() { toHalfWidth(this); calcTotalTax(); };
    inputTaxStd1.onblur = function() { formatCurrency(this); calcTotalTax(); };
    tdTaxStd1.appendChild(inputTaxStd1);

    const tdRate1 = document.createElement('td'); tdRate1.className = "text-center text-xs text-gray-500"; tdRate1.innerText = "1.4%";

    const tdShare = document.createElement('td'); tdShare.rowSpan = 2; tdShare.className = "row-group-border align-middle bg-white";
    const shareGroup = document.createElement('div'); shareGroup.className = "share-input-group";
    const inputNum = document.createElement('input'); inputNum.type = "text"; inputNum.className = "share-input text-xs share-num"; inputNum.value = shareN;
    inputNum.oninput = function() { toHalfWidth(this); calcTotalTax(); };
    const slash = document.createElement('span'); slash.innerText = "/";
    const inputDenom = document.createElement('input'); inputDenom.type = "text"; inputDenom.className = "share-input text-xs share-denom"; inputDenom.value = shareD;
    inputDenom.oninput = function() { toHalfWidth(this); calcTotalTax(); };
    shareGroup.append(inputNum, slash, inputDenom); tdShare.appendChild(shareGroup);

    const tdPropTax1 = document.createElement('td');
    const inputPropTax1 = document.createElement('input');
    inputPropTax1.type = "text"; inputPropTax1.className = "currency prop-tax-output text-primary"; inputPropTax1.value = "0"; inputPropTax1.readOnly = true;
    tdPropTax1.appendChild(inputPropTax1);

    const tdAction = document.createElement('td'); tdAction.rowSpan = 2; tdAction.className = "text-center no-print row-group-border align-middle bg-white";
    const btnDel = document.createElement('button'); btnDel.innerHTML = '<i class="fas fa-times"></i>'; btnDel.className = "text-gray-300 hover:text-alert row-action transition";
    tdAction.appendChild(btnDel);

    tr1.append(tdType, tdName, tdLabel1, tdTaxStd1, tdRate1, tdShare, tdPropTax1, tdAction);

    const tr2 = document.createElement('tr'); tr2.className = "row-group-border";
    const tdLabel2 = document.createElement('td'); tdLabel2.className = "text-center text-xs text-gray-500 bg-gray-50"; tdLabel2.innerText = "都市";
    const tdTaxStd2 = document.createElement('td');
    const inputTaxStd2 = document.createElement('input');
    inputTaxStd2.type = "text"; inputTaxStd2.className = "currency text-gray-700 font-bold tax-std"; 
    inputTaxStd2.value = taxStd2.toLocaleString();
    inputTaxStd2.onfocus = function() { removeFormat(this); };
    inputTaxStd2.oninput = function() { toHalfWidth(this); calcTotalTax(); };
    inputTaxStd2.onblur = function() { formatCurrency(this); calcTotalTax(); };
    tdTaxStd2.appendChild(inputTaxStd2);
    const tdRate2 = document.createElement('td'); tdRate2.className = "text-center text-xs text-gray-500"; tdRate2.innerText = "0.3%";
    const tdPropTax2 = document.createElement('td');
    const inputPropTax2 = document.createElement('input'); inputPropTax2.type = "text"; inputPropTax2.className = "currency prop-tax-output text-primary"; inputPropTax2.value = "0"; inputPropTax2.readOnly = true;
    tdPropTax2.appendChild(inputPropTax2);
    tr2.append(tdLabel2, tdTaxStd2, tdRate2, tdPropTax2);

    btnDel.onclick = function() { tr1.remove(); tr2.remove(); calcTotalTax(); };
    tbody.appendChild(tr1); tbody.appendChild(tr2);
}

// 合計税額の計算と、資金計画への【自動反映】
function calcTotalTax() {
    let totalAnnual = 0;
    const modeEl = document.querySelector('input[name="roundingMode"]:checked');
    const roundingMode = modeEl ? modeEl.value : 'floor1';
    const tbody = document.getElementById('taxTableBody');
    if(!tbody) return;
    
    const rows = Array.from(tbody.children);
    for (let i = 0; i < rows.length; i += 2) {
        const tr1 = rows[i]; const tr2 = rows[i+1];
        if (!tr1 || !tr2) break;

        const numInput = tr1.querySelector('.share-num');
        const denomInput = tr1.querySelector('.share-denom');
        const num = parseFloat(numInput ? numInput.value.replace(/[^\d.]/g, '') : 1) || 1;
        const denom = parseFloat(denomInput ? denomInput.value.replace(/[^\d.]/g, '') : 1) || 1;
        const shareRatio = num / denom;

        const std1 = getNumber(tr1.querySelector('.tax-std').value);
        let tax1 = std1 * 0.014 * shareRatio;
        const std2 = getNumber(tr2.querySelector('.tax-std').value);
        let tax2 = std2 * 0.003 * shareRatio;

        if (roundingMode === 'floor100') {
            tax1 = Math.floor(tax1 / 100) * 100; tax2 = Math.floor(tax2 / 100) * 100;
        } else {
            tax1 = Math.floor(tax1); tax2 = Math.floor(tax2);
        }

        const out1 = tr1.querySelector('.prop-tax-output'); if(out1) out1.value = tax1.toLocaleString();
        const out2 = tr2.querySelector('.prop-tax-output'); if(out2) out2.value = tax2.toLocaleString();

        totalAnnual += (tax1 + tax2);
    }

    const totalEl = document.getElementById('totalAnnualTax');
    if(totalEl) totalEl.value = totalAnnual.toLocaleString();
    
    // ★ここで「年税額 ÷ 12」を資金計画のランニングコスト枠に自動反映します！
    const runTaxInput = document.getElementById('run_tax');
    if (runTaxInput) {
        const monthlyTax = Math.floor(totalAnnual / 12);
        runTaxInput.value = monthlyTax.toLocaleString();
        if(typeof calcRunningCost === 'function') {
            calcRunningCost(); // 総支払額も即座に再計算
        }
    }

    calcProration(); 
}

// 日割り計算
function calcProration() {
    const dateStr = document.getElementById('handoverDate').value;
    if(!dateStr) return;

    const handoverDate = new Date(dateStr);
    const year = handoverDate.getFullYear();
    const startEl = document.querySelector('input[name="startDate"]:checked');
    const startType = startEl ? startEl.value : 'jan1';
    let yearStart, yearEnd;

    if(startType === 'jan1') {
        yearStart = new Date(year, 0, 1); yearEnd = new Date(year, 11, 31);
    } else {
        if (handoverDate.getMonth() < 3) { yearStart = new Date(year - 1, 3, 1); yearEnd = new Date(year, 2, 31); } 
        else { yearStart = new Date(year, 3, 1); yearEnd = new Date(year + 1, 2, 31); }
    }

    const oneDay = 24 * 60 * 60 * 1000;
    const totalDaysInYear = Math.round((yearEnd - yearStart) / oneDay) + 1;
    
    const daysInYearEl = document.getElementById('daysInYear');
    if(daysInYearEl) daysInYearEl.innerText = totalDaysInYear;

    const sellerEnd = new Date(handoverDate);
    sellerEnd.setDate(handoverDate.getDate() - 1);

    let sellerDays = 0; let buyerDays = 0;
    if (sellerEnd >= yearStart) { sellerDays = Math.round((sellerEnd - yearStart) / oneDay) + 1; }
    buyerDays = totalDaysInYear - sellerDays;

    const totalVal = document.getElementById('totalAnnualTax');
    const annualTax = totalVal ? getNumber(totalVal.value) : 0;
    const sellerAmount = Math.round(annualTax * sellerDays / totalDaysInYear);
    const buyerAmount = annualTax - sellerAmount; 

    const f = (d) => `${d.getMonth()+1}/${d.getDate()}`;
    
    const selPeriod = document.getElementById('sellerPeriod'); if(selPeriod) selPeriod.innerText = `${f(yearStart)} 〜 ${f(sellerEnd)}`;
    const selDays = document.getElementById('sellerDays'); if(selDays) selDays.innerText = sellerDays;
    const selAmnt = document.getElementById('sellerAmount'); if(selAmnt) selAmnt.innerText = sellerAmount.toLocaleString();
    const buyPeriod = document.getElementById('buyerPeriod'); if(buyPeriod) buyPeriod.innerText = `${f(handoverDate)} 〜 ${f(yearEnd)}`;
    const buyDays = document.getElementById('buyerDays'); if(buyDays) buyDays.innerText = buyerDays;
    const buyAmnt = document.getElementById('buyerAmount'); if(buyAmnt) buyAmnt.innerText = buyerAmount.toLocaleString();
}

// ★買主の精算額を、資金計画の「諸費用リスト」にワンクリック反映
function reflectTaxToExpenses() {
    const buyerAmountStr = document.getElementById('buyerAmount').innerText;
    const buyerAmount = getNumber(buyerAmountStr);
    
    if(buyerAmount <= 0) {
        showToast("決済日が未入力、または精算額が0円のため反映できません", "error");
        return;
    }

    let found = false;
    const rows = document.querySelectorAll('#expensesList .expense-row');
    rows.forEach(row => {
        const inputs = row.querySelectorAll('input');
        if(inputs.length >= 2 && inputs[0].value.includes('固定資産税')) {
            inputs[1].value = buyerAmount.toLocaleString();
            found = true;
        }
    });

    if(!found) {
        if(typeof addExpenseRow === 'function') {
            addExpenseRow('固定資産税・都市計画税精算金', buyerAmount);
        }
    }

    if(typeof calcTotal === 'function') { calcTotal(); }
    showToast(`資金計画の諸費用に ${buyerAmount.toLocaleString()} 円を反映しました！`);
    
    // 反映したら自動で資金計画画面に戻る
    toggleAppMode();
}

// 固都税ツールの初期起動処理
setTimeout(() => {
    const today = new Date();
    const dateStr = today.getFullYear() + "年" + (today.getMonth()+1) + "月" + today.getDate() + "日";
    const curDateEl = document.getElementById('taxCurrentDate');
    if(curDateEl) curDateEl.innerText = dateStr;
    const taxYearEl = document.getElementById('taxYear');
    if(taxYearEl) taxYearEl.innerText = today.getFullYear();

    const tbody = document.getElementById('taxTableBody');
    if(tbody && tbody.children.length === 0) {
        addTaxRow('land', '', 0, 0, 1, 1);
        addTaxRow('building', '', 0, 0, 1, 1);
        calcTotalTax();
    }
    toggleHighlight();
}, 800);

// 年税額をランニングコストに反映させる専用関数
function reflectAnnualToRunningCost() {
    const totalEl = document.getElementById('totalAnnualTax');
    const totalAnnual = getNumber(totalEl.value);
    
    const runTaxInput = document.getElementById('run_tax');
    if (runTaxInput) {
        const monthlyTax = Math.floor(totalAnnual / 12);
        runTaxInput.value = monthlyTax.toLocaleString();
        if(typeof calcRunningCost === 'function') {
            calcRunningCost(); 
        }
    }
}