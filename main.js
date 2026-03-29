// --- PWAインストール機能追加 ---
        let deferredPrompt;
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            const installBtn = document.getElementById('install-app-btn');
            if (installBtn) {
                installBtn.classList.remove('hidden');
                installBtn.onclick = async () => {
                    deferredPrompt.prompt();
                    const { outcome } = await deferredPrompt.userChoice;
                    if (outcome === 'accepted') {
                        installBtn.classList.add('hidden');
                    }
                    deferredPrompt = null;
                };
            }
        });

        // --- トースト通知 ---
        function showToast(message, type = 'success') {
            const toast = document.createElement('div');
            toast.textContent = message;
            const bgClass = type === 'success' ? 'bg-green-600' : 'bg-red-600';
            toast.className = "fixed top-20 right-4 " + bgClass + " text-white px-4 py-3 rounded shadow-lg z-[100] transition-opacity duration-300 font-bold text-sm";
            document.body.appendChild(toast);
            setTimeout(() => {
                toast.classList.add('opacity-0');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }

        function removeFormat(input) {
            let val = input.value.replace(/,/g, "");
            input.value = val;
        }

        let currentGlobalTargetId = 'propertyPrice';       
        
        let bankData = {
            hokuyo: { id: 'hokuyo', name: '北洋銀行', type: '地銀 / 定率型', icon: 'fa-building', features: [{text:'給与振込で優遇', color:'blue'}, {text:'保証料込み', color:'gray'}], plans: [{ name: '定率型 3年固定', rate: 0.500, feeType: 'rate', feeValue: 0.022, guaranteeType: 'none' }, { name: '定率型 5年固定', rate: 1.010, feeType: 'rate', feeValue: 0.022, guaranteeType: 'none' }, { name: '定率型 10年固定', rate: 1.420, feeType: 'rate', feeValue: 0.022, guaranteeType: 'none' }, { name: 'スペシャル 3年固定 (保証料込)', rate: 0.850, feeType: 'fixed', feeValue: 55000, guaranteeType: 'none' }] },
            dougin: { id: 'dougin', name: '北海道銀行', type: '地銀 / 定額型', icon: 'fa-landmark', features: [{text:'道銀アプリ連携', color:'green'}], plans: [{ name: '固定特約 3年 (標準)', rate: 0.850, feeType: 'fixed', feeValue: 55000, guaranteeType: 'lump' }, { name: '固定特約 10年 (標準)', rate: 1.850, feeType: 'fixed', feeValue: 55000, guaranteeType: 'lump' }] },
            rokin: { id: 'rokin', name: '北海道ろうきん', type: '協同組織', icon: 'fa-users', features: [{text:'会員は保証料0円', color:'yellow'}], plans: [{ name: 'すまいる上手 3年 (会員)', rate: 0.500, feeType: 'rate', feeValue: 0.022, guaranteeType: 'none' }, { name: 'すまいる上手 3年 (一般)', rate: 1.000, feeType: 'rate', feeValue: 0.022, guaranteeType: 'rate_lump_1.1' }] },
            aeon: { id: 'aeon', name: 'イオン銀行', type: '流通系', icon: 'fa-shopping-cart', features: [{text:'お買い物5%OFF', color:'pink'}], plans: [{ name: '変動金利 (定率型)', rate: 0.380, feeType: 'rate', feeValue: 0.022, guaranteeType: 'none' }, { name: '当初10年固定', rate: 1.350, feeType: 'rate', feeValue: 0.022, guaranteeType: 'none' }] },
            sbi: { id: 'sbi', name: '住信SBIネット銀行', type: 'ネット専業', icon: 'fa-laptop', features: [{text:'全疾病保障無料', color:'blue'}], plans: [{ name: '変動金利 (物件80%以内)', rate: 0.320, feeType: 'rate', feeValue: 0.022, guaranteeType: 'none' }, { name: '変動金利 (物件80%超)', rate: 0.698, feeType: 'rate', feeValue: 0.022, guaranteeType: 'none' }, { name: '固定特約 10年', rate: 1.800, feeType: 'rate', feeValue: 0.022, guaranteeType: 'none' }] },
            jibun: { id: 'jibun', name: 'auじぶん銀行', type: 'ネット専業', icon: 'fa-wifi', features: [{text:'がん団信50%無料', color:'gray'}], plans: [{ name: '変動金利 (物件80%以内)', rate: 0.684, feeType: 'rate', feeValue: 0.022, guaranteeType: 'none' }, { name: '固定特約 10年', rate: 1.195, feeType: 'rate', feeValue: 0.022, guaranteeType: 'none' }] },
            hokumon: { id: 'hokumon', name: '北門信用金庫', type: '信用金庫', icon: 'fa-handshake', features: [{text:'最長50年対応', color:'purple'}], plans: [{ name: '固定特約 3年', rate: 0.850, feeType: 'fixed', feeValue: 55000, guaranteeType: 'lump' }, { name: '変動金利', rate: 1.000, feeType: 'fixed', feeValue: 55000, guaranteeType: 'lump' }] },
            flat: { id: 'flat', name: 'フラット35', type: '全期間固定', icon: 'fa-home', features: [{text:'団信なしも可', color:'gray'}], plans: [{ name: '全期間固定 (定率型)', rate: 1.800, feeType: 'rate', feeValue: 0.022, guaranteeType: 'none' }, { name: 'フラット35S (当初5年引下)', rate: 1.550, feeType: 'rate', feeValue: 0.022, guaranteeType: 'none' }] }
        };

        let appData = { expenses: null };

        // ダウンロードしたHTMLから保存された設定を復元する
        function loadAppData() {
            const storage = document.getElementById('app-data-storage');
            if (storage && storage.textContent.trim() !== "" && storage.textContent.trim() !== "{}") {
                try {
                    const parsed = JSON.parse(storage.textContent);
                    if (parsed.bankData) bankData = parsed.bankData;
                    if (parsed.expenses) appData.expenses = parsed.expenses;
                } catch (e) {
                    console.error("AppData Parse Error", e);
                }
            }
        }

        // HTMLダウンロード時に設定をDOMに保存する
        function saveAppDataToDOM() {
            const expenses = [];
            document.querySelectorAll('.expense-row').forEach(row => {
                const inputs = row.querySelectorAll('input');
                if(inputs.length >= 2) {
                    expenses.push({
                        name: inputs[0].value,
                        amount: getNumber(inputs[1].value)
                    });
                }
            });
            
            const storageObj = {
                bankData: bankData,
                expenses: expenses
            };

            let storage = document.getElementById('app-data-storage');
            if (!storage) {
                storage = document.createElement('script');
                storage.id = 'app-data-storage';
                storage.type = 'application/json';
                document.head.appendChild(storage);
            }
            storage.textContent = JSON.stringify(storageObj);
        }

        function initExpenses() {
            const container = document.getElementById('expensesList');
            container.innerHTML = '';
            
            const exps = appData.expenses ? appData.expenses : defaultExpenses;
            exps.forEach(exp => addExpenseRow(exp.name, exp.amount));
            
            calcTotal();
            initSortable();
            updateGlobalSelector();
        }

        function toggleExpenseModal() {
            const modal = document.getElementById('expenseListModal');
            if (modal.classList.contains('hidden')) {
                renderExpenseModalContent();
                modal.classList.remove('hidden');
            } else {
                modal.classList.add('hidden');
            }
        }

        function renderExpenseModalContent() {
            const container = document.getElementById('expenseModalListContainer');
            container.innerHTML = '';
            const rows = document.querySelectorAll('#expensesList .expense-row');
            rows.forEach((row, index) => {
                const nameInputRaw = row.querySelector('input[type="text"]');
                const amountInputRaw = row.querySelector('.input-currency');
                
                const div = document.createElement('div');
                div.className = 'flex gap-2 mb-2 items-center border-b border-gray-50 pb-2 last:border-0';
                
                const inputName = document.createElement('input');
                inputName.type = 'text';
                inputName.value = nameInputRaw.value;
                inputName.className = 'border border-gray-200 rounded px-2 py-1.5 flex-1 text-sm bg-gray-50 focus:border-accent outline-none';
                inputName.placeholder = '項目名';
                inputName.oninput = (e) => { nameInputRaw.value = e.target.value; updateGlobalSelector(); };
                
                const inputAmount = document.createElement('input');
                inputAmount.type = 'text';
                inputAmount.value = amountInputRaw.value;
                inputAmount.className = 'border border-gray-200 rounded px-2 py-1.5 w-28 text-right font-bold text-sm bg-white focus:border-accent outline-none ime-normal';
                inputAmount.placeholder = '0';
                inputAmount.onfocus = (e) => { removeFormat(e.target); };
                inputAmount.oninput = (e) => { toHalfWidth(e.target); amountInputRaw.value = e.target.value; calcTotal(); };
                inputAmount.onblur = (e) => { formatCurrency(e.target); formatCurrency(amountInputRaw); };

                const delBtn = document.createElement('button');
                delBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
                delBtn.className = 'text-gray-300 hover:text-red-500 w-8 h-8 flex items-center justify-center rounded hover:bg-red-50 transition';
                delBtn.onclick = () => { row.remove(); calcTotal(); updateGlobalSelector(); renderExpenseModalContent(); };

                div.appendChild(inputName);
                div.appendChild(inputAmount);
                div.appendChild(delBtn);
                container.appendChild(div);
            });
        }

        function addExpenseFromModal() {
            addExpenseRow(); 
            calcTotal();
            updateGlobalSelector();
            renderExpenseModalContent();
            const container = document.getElementById('expenseModalListContainer');
            setTimeout(() => { container.scrollTop = container.scrollHeight; }, 50);
        }

        function updateGlobalSelector() {
            const selector = document.getElementById('globalItemSelector');
            const currentVal = selector.value || 'propertyPrice';
            selector.innerHTML = ''; 

            const optProp = document.createElement('option');
            optProp.value = 'propertyPrice'; optProp.textContent = '物件価格';
            selector.appendChild(optProp);

            const expenseRows = document.querySelectorAll('.expense-row');
            expenseRows.forEach((row, index) => {
                const nameInput = row.querySelector('input[type="text"]');
                const amountInput = row.querySelector('.input-currency');
                if (nameInput && amountInput) {
                    const globalId = amountInput.getAttribute('data-global-id');
                    const opt = document.createElement('option');
                    opt.value = globalId; 
                    opt.textContent = nameInput.value || "(諸費用 " + (index + 1) + ")";
                    selector.appendChild(opt);
                }
            });

            const optDown = document.createElement('option');
            optDown.value = 'downPayment'; optDown.textContent = '自己資金（頭金）';
            selector.appendChild(optDown);

            if ([...selector.options].some(o => o.value === currentVal)) {
                selector.value = currentVal;
            } else {
                selector.value = 'propertyPrice';
                switchGlobalTarget('propertyPrice');
            }
        }

        function switchGlobalTarget(targetId) {
            currentGlobalTargetId = targetId;
            const targetInput = document.querySelector('input[data-global-id="' + targetId + '"]');
            const globalInput = document.getElementById('globalPropertyPrice');
            if (targetInput) { globalInput.value = targetInput.value; } else { globalInput.value = ''; }
        }

        function handleGlobalInput(globalInput) {
            const targetInput = document.querySelector('input[data-global-id="' + currentGlobalTargetId + '"]');
            if (targetInput) { targetInput.value = globalInput.value; calcTotal(); }
        }

        function handleSheetInputChange(sheetInput) {
            const globalId = sheetInput.getAttribute('data-global-id');
            if (globalId === currentGlobalTargetId) {
                const globalInput = document.getElementById('globalPropertyPrice');
                globalInput.value = sheetInput.value;
            }
            calcTotal();
        }

        function toHalfWidth(input) {
            const val = input.value;
            if (/[０-９]/.test(val)) {
                const start = input.selectionStart;
                const end = input.selectionEnd;
                const newVal = val.replace(/[０-９]/g, function(s) {
                    return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
                });
                input.value = newVal;
                if (input.setSelectionRange) { input.setSelectionRange(start, end); }
            }
        }

        function generateId() { return 'gid-' + Math.random().toString(36).substr(2, 9); }

        function initSortable() {
            const el = document.getElementById('expensesList');
            if (el) {
                Sortable.create(el, {
                    handle: '.drag-handle', animation: 150, ghostClass: 'sortable-ghost',
                    onEnd: function() { calcTotal(); updateGlobalSelector(); }
                });
            }
        }

        function addExpenseRow(name = "", amount = 0) {
            const container = document.getElementById('expensesList');
            const row = document.createElement('div');
            row.className = "flex items-center gap-2 expense-row border-b border-gray-100 py-1";
            
            const handle = document.createElement('div');
            handle.className = "text-gray-300 hover:text-gray-500 cursor-move w-6 flex justify-center items-center drag-handle no-print";
            handle.innerHTML = '<i class="fas fa-grip-vertical"></i>';
            
            const nameInput = document.createElement('input');
            nameInput.type = "text"; 
            nameInput.className = "flex-1 focus:border-accent outline-none py-1 text-sm text-gray-700 bg-transparent"; 
            nameInput.value = name; nameInput.placeholder = "項目名";
            nameInput.onblur = function() { updateGlobalSelector(); };

            let toggleBtn = null;
            if (name.includes('金銭消費貸借契約') || name.includes('金銭所非貸借契約')) {
                toggleBtn = document.createElement('button');
                toggleBtn.className = "text-[10px] bg-blue-100 text-blue-700 px-1 rounded ml-1 hover:bg-blue-200 transition toggle-btn no-print";
                toggleBtn.innerHTML = '<i class="fas fa-sync-alt"></i> 切替';
                toggleBtn.onclick = function() { toggleContractType(row, nameInput, amountInput); };
            }
            
            const amountInput = document.createElement('input');
            amountInput.type = "text"; 
            amountInput.className = "w-24 sm:w-32 text-right font-bold focus:border-accent outline-none py-1 text-base input-currency bg-transparent border-b border-gray-300 ime-normal"; 
            amountInput.value = amount.toLocaleString();
            amountInput.setAttribute('data-global-id', generateId());
            amountInput.onfocus = function() { removeFormat(this); };
            amountInput.oninput = function() { toHalfWidth(this); handleSheetInputChange(this); }; 
            amountInput.onblur = function() { formatCurrency(this); };
            
            const unit = document.createElement('span'); 
            unit.className = "text-xs text-gray-500 w-4"; unit.innerText = "円";
            
            const delBtn = document.createElement('button'); 
            delBtn.className = "text-gray-300 hover:text-alert w-6 no-print row-action"; 
            delBtn.innerHTML = '<i class="fas fa-times"></i>'; 
            delBtn.onclick = function() { row.remove(); calcTotal(); updateGlobalSelector(); };
            
            row.appendChild(handle); row.appendChild(nameInput); 
            if (toggleBtn) row.appendChild(toggleBtn); 
            row.appendChild(amountInput); row.appendChild(unit); row.appendChild(delBtn);
            container.appendChild(row);
        }

        function toggleContractType(row, nameInput, amountInput) {
            const currentName = nameInput.value;
            if (currentName.includes('印紙代')) {
                nameInput.value = "電子契約手数料（金銭消費貸借契約）";
                amountInput.value = "5,500";
            } else {
                nameInput.value = "印紙代（金銭消費貸借契約書）";
            }
            updateGlobalSelector(); calcTotal();
        }

        function formatCurrency(input) {
            let val = input.value.replace(/,/g, "").replace(/[^0-9]/g, "");
            val = val.replace(/[０-９]/g, function(s) { return String.fromCharCode(s.charCodeAt(0) - 0xFEE0); });
            val = val.replace(/[^0-9]/g, "");
            if (val === "") { input.value = ""; return; }
            const num = parseInt(val, 10);
            input.value = num.toLocaleString();
        }

        function getNumber(val) { 
            if(!val) return 0;
            let strVal = val.toString().replace(/[０-９]/g, function(s) { return String.fromCharCode(s.charCodeAt(0) - 0xFEE0); });
            strVal = strVal.replace(/,/g, "");
            const num = parseInt(strVal, 10);
            return isNaN(num) ? 0 : num;
        }

        function calculateSalesStampDuty(amount) {
            if (amount < 10000) return 0;
            if (amount <= 100000) return 200;
            if (amount <= 500000) return 400;
            if (amount <= 1000000) return 1000;
            if (amount <= 5000000) return 1000;
            if (amount <= 10000000) return 5000;
            if (amount <= 50000000) return 10000;
            if (amount <= 100000000) return 30000;
            if (amount <= 500000000) return 60000;
            if (amount <= 1000000000) return 160000;
            if (amount <= 5000000000) return 320000;
            return 480000;
        }

        function calculateLoanStampDuty(amount) {
            if (amount < 10000) return 0;
            if (amount <= 100000) return 200;
            if (amount <= 500000) return 400;
            if (amount <= 1000000) return 1000;
            if (amount <= 5000000) return 2000;
            if (amount <= 10000000) return 10000;
            if (amount <= 50000000) return 20000;
            if (amount <= 100000000) return 60000;
            if (amount <= 500000000) return 100000;
            if (amount <= 1000000000) return 200000;
            if (amount <= 5000000000) return 400000;
            return 600000;
        }

        let isCalcTotalRunning = false; 

        function calcTotal() {
            if (isCalcTotalRunning) return;
            isCalcTotalRunning = true;
            
            try {
                const propPrice = getNumber(document.getElementById('propertyPrice').value);
                
                let brokerageFee = 0;
                if (propPrice > 0) {
                    if (propPrice <= 2000000) {
                        brokerageFee = Math.floor(propPrice * 0.05 * 1.1);
                    } else if (propPrice <= 4000000) {
                        brokerageFee = Math.floor((propPrice * 0.04 + 20000) * 1.1);
                    } else {
                        brokerageFee = Math.floor((propPrice * 0.03 + 60000) * 1.1);
                    }
                }

                const salesStampDuty = calculateSalesStampDuty(propPrice);

                document.querySelectorAll('.expense-row').forEach(row => {
                    const inputs = row.querySelectorAll('input');
                    if (inputs.length >= 2) {
                        const nameVal = inputs[0].value;
                        if (nameVal.includes('仲介手数料')) {
                            inputs[1].value = brokerageFee.toLocaleString();
                        } else if (nameVal.includes('印紙代（売買契約書）')) {
                            inputs[1].value = salesStampDuty.toLocaleString();
                        }
                    }
                });

                let expenses = 0;
                document.querySelectorAll('.expense-row .input-currency').forEach(input => { 
                    expenses += getNumber(input.value); 
                });
                const grandTotalTemp = propPrice + expenses;
                const downPayment = getNumber(document.getElementById('downPayment').value);
                const tempLoanAmount = Math.max(0, grandTotalTemp - downPayment);

                const loanStampDuty = calculateLoanStampDuty(tempLoanAmount);

                let expensesChanged = false;
                document.querySelectorAll('.expense-row').forEach(row => {
                    const inputs = row.querySelectorAll('input');
                    if (inputs.length >= 2) {
                        const nameVal = inputs[0].value;
                        if (nameVal.includes('印紙代（金銭消費貸借契約書）')) {
                            const currentVal = getNumber(inputs[1].value);
                            if (currentVal !== loanStampDuty) {
                                inputs[1].value = loanStampDuty.toLocaleString();
                                expensesChanged = true;
                            }
                        }
                    }
                });

                expenses = 0;
                document.querySelectorAll('.expense-row .input-currency').forEach(input => { 
                    expenses += getNumber(input.value); 
                });

                const bankFee = getNumber(document.getElementById('res_fee').innerText);
                let guaranteeFee = 0;
                const gText = document.getElementById('res_guarantee').innerText || "";
                if(gText.includes('円') && !gText.includes('別途')) {
                    let pVal = parseInt(gText.replace(/[^0-9]/g, ''));
                    if(!isNaN(pVal)) guaranteeFee = pVal;
                }
                
                const separateTotal = bankFee + guaranteeFee;
                document.getElementById('separateFeeInput').value = separateTotal.toLocaleString();

                const grandTotal = propPrice + expenses; 
                document.getElementById('grandTotal').innerText = grandTotal.toLocaleString();

                const loanAmount = Math.max(0, grandTotal - downPayment);
                
                document.getElementById('loanAmountDisplay').innerText = loanAmount.toLocaleString();
                
                calculateLoan(true);
                
                const targetInput = document.querySelector('input[data-global-id="' + currentGlobalTargetId + '"]');
                if (targetInput) {
                    const globalInput = document.getElementById('globalPropertyPrice');
                    if (document.activeElement !== globalInput) {
                        globalInput.value = targetInput.value;
                    }
                }
            } catch (err) {
                console.error("calcTotal Error: ", err);
            } finally {
                isCalcTotalRunning = false;
            }
        }

        function renderBankCards() {
            const container = document.getElementById("bankCardsContainer");
            if(!container) return;
            container.innerHTML = "";
            const banks = Object.values(bankData);
            
            banks.forEach(bank => {
                const card = document.createElement("div");
                card.className = "bank-card h-full flex flex-col";
                card.id = "card-" + bank.id;
                card.onclick = function() { setBank(bank.id); };
                
                let plansHtml = "";
                bank.plans.slice(0, 3).forEach((plan, idx) => {
                    plansHtml += `<div class="plan-info"><span class="text-xs font-bold text-gray-600 truncate mr-2">${plan.name}</span><span class="text-lg font-bold text-primary flex-shrink-0"><span data-rate-bank="${bank.id}" data-rate-plan="${idx}">${plan.rate.toFixed(3)}</span>%</span></div>`;
                });
                
                let featuresHtml = "";
                if(bank.features) {
                    bank.features.forEach(f => {
                        featuresHtml += `<span class="feature-badge bg-${f.color}-100 text-${f.color}-700 mr-1">${f.text}</span>`;
                    });
                }
                
                card.innerHTML = `<div class="flex justify-between items-start mb-3"><div><h3 class="text-xl font-black text-primary">${bank.name}</h3><span class="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-500 font-bold">${bank.type || "カスタム"}</span></div><i class="fas ${bank.icon || "fa-building"} text-gray-200 text-3xl"></i></div><div class="space-y-2 flex-1">${plansHtml}</div><div class="mt-3 pt-2 border-t border-gray-100">${featuresHtml}</div>`;
                
                container.appendChild(card);
            });
        }

        function initSimulator() {
            const bankSelect = document.getElementById('sim_bank');
            const currentVal = bankSelect.value;
            bankSelect.innerHTML = '';
            Object.values(bankData).forEach(bank => {
                const option = document.createElement('option');
                option.value = bank.id; option.textContent = bank.name;
                bankSelect.appendChild(option);
            });
            if([...bankSelect.options].some(o => o.value === currentVal)) {
                bankSelect.value = currentVal;
            }
            updatePlans();
        }

        function updatePlans() {
            const bankId = document.getElementById('sim_bank').value;
            const bank = bankData[bankId];
            const planSelect = document.getElementById('sim_plan');
            const currentPlan = planSelect.selectedIndex;
            planSelect.innerHTML = '';
            
            if(bank && bank.plans) {
                bank.plans.forEach((plan, index) => {
                    const option = document.createElement('option');
                    option.value = index;
                    option.textContent = plan.name;
                    option.dataset.rate = plan.rate;
                    option.dataset.feeType = plan.feeType;
                    option.dataset.feeValue = plan.feeValue;
                    option.dataset.guaranteeType = plan.guaranteeType;
                    planSelect.appendChild(option);
                });
            }
            if (currentPlan >= 0 && currentPlan < planSelect.options.length) {
                planSelect.selectedIndex = currentPlan;
            }
            updateRateFromPlan();
        }

        function updateRateFromPlan() {
            const planSelect = document.getElementById('sim_plan');
            const selectedOption = planSelect.options[planSelect.selectedIndex];
            if(selectedOption) {
                document.getElementById('sim_rate').value = parseFloat(selectedOption.dataset.rate).toFixed(3);
            }
            calculateLoan(); 
        }

        function setBank(bankId) {
            if (!bankData[bankId]) return;
            document.getElementById('sim_bank').value = bankId;
            updatePlans();
            document.querySelectorAll('.bank-card').forEach(card => card.classList.remove('active'));
            const activeCard = document.getElementById('card-' + bankId);
            if(activeCard) activeCard.classList.add('active');
        }

        let isCalculating = false;

        function calculateMonthlyPayment(amount, rateYear, years) {
            if (amount <= 0 || isNaN(amount)) return 0;
            if (isNaN(rateYear) || isNaN(years) || years <= 0) return 0;
            if (rateYear <= 0) return Math.round(amount / (years * 12));
            const rateMonth = rateYear / 12;
            const numPayments = years * 12;
            const x = Math.pow(1 + rateMonth, numPayments);
            return Math.round((amount * rateMonth * x) / (x - 1));
        }

        function calculateLoan(fromCalcTotal = false) {
            if(isCalculating) return;
            isCalculating = true;
            
            try {
                const propPrice = getNumber(document.getElementById('propertyPrice').value) || 0;
                const amount = getNumber(document.getElementById('loanAmountDisplay').innerText) || 0; 
                let rVal = parseFloat(document.getElementById('sim_rate').value);
                if(isNaN(rVal)) rVal = 0;
                const rateYear = rVal / 100;
                let years = parseInt(document.getElementById('sim_years').value);
                if(isNaN(years) || years <= 0) years = 35;
                
                let monthly = calculateMonthlyPayment(amount, rateYear, years);
                let total = monthly * years * 12;

                const planSelect = document.getElementById('sim_plan');
                const selectedOption = planSelect.options[planSelect.selectedIndex];
                
                let fee = 0;
                let guaranteeText = "0 円";
                let guaranteeNote = "なし";
                let guaranteeVal = 0;

                if (selectedOption) {
                    const feeType = selectedOption.dataset.feeType;
                    const feeValue = parseFloat(selectedOption.dataset.feeValue) || 0;
                    if (feeType === 'rate') {
                        fee = Math.round(amount * feeValue);
                        if (fee < 220000 && document.getElementById('sim_bank').value === 'aeon') fee = 220000;
                    } else {
                        fee = feeValue;
                    }

                    const gType = selectedOption.dataset.guaranteeType || 'none';
                    if (gType === 'lump') {
                        guaranteeText = "別途見積";
                        guaranteeNote = "※一括払いが必要（借入額により変動）";
                    } else if (gType === 'rate_lump_1.1') {
                        guaranteeVal = Math.round(amount * 0.011); 
                        guaranteeText = guaranteeVal.toLocaleString() + " 円";
                        guaranteeNote = "※1.1%概算";
                    }
                }

                document.getElementById('sim_display_property').innerText = propPrice.toLocaleString();
                document.getElementById('sim_display_loan').innerText = amount.toLocaleString();
                document.getElementById('res_monthly').innerText = monthly.toLocaleString();
                document.getElementById('res_total').innerText = total.toLocaleString();
                document.getElementById('res_fee').innerText = fee.toLocaleString();
                document.getElementById('res_guarantee').innerText = guaranteeText;
                document.getElementById('res_guarantee_note').innerText = guaranteeNote;

                const loan100 = amount + 1000000;
                const loan200 = amount + 2000000;
                const monthly100 = calculateMonthlyPayment(loan100, rateYear, years);
                const monthly200 = calculateMonthlyPayment(loan200, rateYear, years);
                const diff100 = monthly100 - monthly;
                const diff200 = monthly200 - monthly;

                document.getElementById('comp_loan_100').innerText = loan100.toLocaleString();
                document.getElementById('comp_monthly_100').innerText = monthly100.toLocaleString();
                document.getElementById('comp_diff_100').innerText = diff100.toLocaleString();
                document.getElementById('comp_loan_200').innerText = loan200.toLocaleString();
                document.getElementById('comp_monthly_200').innerText = monthly200.toLocaleString();
                document.getElementById('comp_diff_200').innerText = diff200.toLocaleString();

                calcRunningCost();
            } catch (e) {
                console.error("calculateLoan error: ", e);
            } finally {
                isCalculating = false;
                if(!fromCalcTotal) { calcTotal(); }
            }
        }

        function addNewBank() {
            const newId = "custom_" + Date.now();
            bankData[newId] = {
                id: newId,
                name: "新規金融機関",
                type: "カスタム設定",
                icon: "fa-building",
                features: [{text:"自由設定", color:"gray"}],
                plans: [
                    { name: "変動金利プラン", rate: 0.500, feeType: "rate", feeValue: 0.022, guaranteeType: "none" },
                    { name: "固定金利プラン", rate: 1.500, feeType: "fixed", feeValue: 55000, guaranteeType: "none" }
                ]
            };
            openRateModal();
            setTimeout(() => {
                const content = document.getElementById("rateModalContent");
                content.scrollTop = content.scrollHeight;
            }, 50);
        }

        function openRateModal() {
            const content = document.getElementById("rateModalContent");
            content.innerHTML = "";

            const addBtn = document.createElement("button");
            addBtn.className = "w-full mb-4 py-3 border-2 border-dashed border-accent text-accent rounded-lg hover:bg-blue-50 transition font-bold flex items-center justify-center gap-2";
            addBtn.innerHTML = `<i class="fas fa-plus"></i> 新規金融機関を追加`;
            addBtn.onclick = function() { addNewBank(); };
            content.appendChild(addBtn);

            Object.values(bankData).forEach(bank => {
                const section = document.createElement("div");
                section.className = "mb-4 border border-gray-200 rounded-lg overflow-hidden shadow-sm";

                const header = document.createElement("div");
                header.className = "bg-gray-50 px-4 py-3 flex justify-between items-center hover:bg-gray-100 transition";
                
                const bankNameInput = document.createElement("input");
                bankNameInput.type = "text";
                bankNameInput.className = "font-bold text-gray-800 text-base bg-transparent border-b border-transparent focus:border-accent outline-none w-1/2";
                bankNameInput.value = bank.name;
                bankNameInput.id = "input-bankname-" + bank.id;
                bankNameInput.onclick = function(e) { e.stopPropagation(); };

                const toggleDiv = document.createElement("div");
                toggleDiv.className = "cursor-pointer flex-1 text-right py-1 pl-4";
                toggleDiv.innerHTML = `<i class="fas fa-chevron-down text-gray-400 transition-transform duration-200"></i>`;

                header.appendChild(bankNameInput);
                header.appendChild(toggleDiv);

                const body = document.createElement("div");
                body.className = "p-4 bg-white hidden border-t border-gray-200";

                const addPlanBtn = document.createElement("button");
                addPlanBtn.className = "mb-3 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded transition";
                addPlanBtn.innerHTML = `<i class="fas fa-plus"></i> プラン追加`;
                addPlanBtn.onclick = function() {
                    bank.plans.push({ name: "新規プラン", rate: 1.000, feeType: "rate", feeValue: 0.022, guaranteeType: "none" });
                    openRateModal();
                };
                body.appendChild(addPlanBtn);

                const grid = document.createElement("div");
                grid.className = "grid grid-cols-1 gap-4";

                bank.plans.forEach((plan, idx) => {
                    const wrapper = document.createElement("div");
                    wrapper.className = "bg-white border border-gray-200 rounded p-3 flex flex-wrap md:flex-nowrap items-end gap-2 md:gap-4 relative";
                    
                    const delPlanBtn = document.createElement("button");
                    delPlanBtn.className = "absolute top-2 right-2 text-gray-400 hover:text-red-500";
                    delPlanBtn.innerHTML = `<i class="fas fa-times"></i>`;
                    delPlanBtn.onclick = function() {
                        if(confirm("このプランを削除しますか？")) {
                            bank.plans.splice(idx, 1);
                            openRateModal();
                        }
                    };
                    wrapper.appendChild(delPlanBtn);

                    const nameDiv = document.createElement("div");
                    nameDiv.className = "w-full md:w-1/4 mb-2 md:mb-0";
                    nameDiv.innerHTML = `<span class="text-[10px] text-gray-500 block mb-1">プラン名</span><input type="text" id="input-planname-${bank.id}-${idx}" class="w-full border-b border-gray-300 focus:border-accent outline-none font-bold text-sm text-gray-700 bg-transparent" value="${plan.name}">`;
                    wrapper.appendChild(nameDiv);

                    const rateDiv = document.createElement("div");
                    rateDiv.className = "w-[48%] md:w-1/5";
                    rateDiv.innerHTML = `<span class="text-[10px] text-gray-500 block mb-1">金利 (%)</span><input type="number" step="0.001" id="input-rate-${bank.id}-${idx}" class="w-full border border-gray-300 rounded p-1 text-right font-bold text-primary" value="${plan.rate.toFixed(3)}">`;
                    wrapper.appendChild(rateDiv);

                    const typeDiv = document.createElement("div");
                    typeDiv.className = "w-[48%] md:w-1/5";
                    const typeSelect = document.createElement("select");
                    typeSelect.className = "w-full border border-gray-300 rounded p-1 text-xs";
                    typeSelect.id = `input-feeType-${bank.id}-${idx}`;
                    const optFixed = document.createElement("option"); optFixed.value = "fixed"; optFixed.textContent = "定額 (円)";
                    if(plan.feeType === "fixed") optFixed.selected = true;
                    const optRate = document.createElement("option"); optRate.value = "rate"; optRate.textContent = "定率 (%)";
                    if(plan.feeType === "rate") optRate.selected = true;
                    typeSelect.appendChild(optFixed); typeSelect.appendChild(optRate);
                    typeDiv.innerHTML = `<span class="text-[10px] text-gray-500 block mb-1">手数料タイプ</span>`;
                    typeDiv.appendChild(typeSelect);
                    wrapper.appendChild(typeDiv);

                    const valDiv = document.createElement("div");
                    valDiv.className = "w-full md:w-1/4 mt-2 md:mt-0";
                    let displayVal = plan.feeType === "rate" ? (plan.feeValue * 100).toFixed(2) : plan.feeValue;
                    let stepVal = plan.feeType === "rate" ? "0.01" : "1000";
                    valDiv.innerHTML = `<span class="text-[10px] text-gray-500 block mb-1">手数料 (円 or %)</span><input type="number" step="${stepVal}" id="input-feeValue-${bank.id}-${idx}" class="w-full border border-gray-300 rounded p-1 text-right" value="${displayVal}">`;
                    wrapper.appendChild(valDiv);

                    grid.appendChild(wrapper);
                });
                body.appendChild(grid);

                const delBankDiv = document.createElement("div");
                delBankDiv.className = "mt-4 pt-3 border-t border-gray-100 text-right";
                delBankDiv.innerHTML = `<button class="text-xs text-red-500 hover:text-red-700"><i class="fas fa-trash-alt mr-1"></i>この金融機関を削除</button>`;
                delBankDiv.onclick = function() {
                    if(confirm(bank.name + " を削除しますか？")) {
                        delete bankData[bank.id];
                        openRateModal();
                    }
                };
                body.appendChild(delBankDiv);

                section.appendChild(header);
                section.appendChild(body);

                header.onclick = function(e) {
                    if(e.target === bankNameInput) return;
                    const isHidden = body.classList.contains("hidden");
                    if(isHidden) {
                        body.classList.remove("hidden");
                        toggleDiv.querySelector("i").classList.add("rotate-180");
                    } else {
                        body.classList.add("hidden");
                        toggleDiv.querySelector("i").classList.remove("rotate-180");
                    }
                };

                content.appendChild(section);
            });
            document.getElementById("rateModal").classList.remove("hidden");
        }

        function closeRateModal() { document.getElementById("rateModal").classList.add("hidden"); }

        function updateRates() {
            Object.values(bankData).forEach(bank => {
                const nameEl = document.getElementById("input-bankname-" + bank.id);
                if (nameEl && nameEl.value.trim() !== "") bank.name = nameEl.value.trim();

                bank.plans.forEach((plan, idx) => {
                    const planNameEl = document.getElementById("input-planname-" + bank.id + "-" + idx);
                    if (planNameEl) plan.name = planNameEl.value;

                    const rateEl = document.getElementById("input-rate-" + bank.id + "-" + idx);
                    if (rateEl) { const val = parseFloat(rateEl.value); if (!isNaN(val)) plan.rate = val; }
                    
                    const typeEl = document.getElementById("input-feeType-" + bank.id + "-" + idx);
                    const valEl = document.getElementById("input-feeValue-" + bank.id + "-" + idx);
                    if (typeEl && valEl) {
                        const newType = typeEl.value;
                        let newVal = parseFloat(valEl.value);
                        if (!isNaN(newVal)) {
                            plan.feeType = newType;
                            if (newType === "rate") { plan.feeValue = newVal / 100; } else { plan.feeValue = newVal; }
                        }
                    }
                });
            });
            
            closeRateModal();
            renderBankCards();
            initSimulator();
            
            const firstBankId = Object.keys(bankData)[0];
            if(firstBankId) setBank(firstBankId);
            
            showToast("金利・手数料情報を保存しました。");
        }

        function syncCustomerName(val) {
            document.getElementById('headerCustomerNameDisplay').innerText = val || "　　様";
        }

        function downloadHTML() {
            saveAppDataToDOM();

            document.querySelectorAll('input').forEach(input => {
                if(input.type === 'text' || input.type === 'number') {
                    input.setAttribute('value', input.value);
                }
            });
            document.querySelectorAll('select').forEach(select => {
                const options = select.querySelectorAll('option');
                options.forEach(option => {
                    if (option.value === select.value) option.setAttribute('selected', 'selected');
                    else option.removeAttribute('selected');
                });
            });
            
            const htmlContent = document.documentElement.outerHTML;
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'Financial-Plan.html';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            showToast('設定を維持したHTMLを保存しました。');
        }
// ランニングコストと総支払額の計算
        function calcRunningCost() {
            try {
                // 各入力欄から金額を取得
                const runMgmt = getNumber(document.getElementById('run_management').value) || 0;
                const runRep  = getNumber(document.getElementById('run_repair').value) || 0;
                const runPark = getNumber(document.getElementById('run_parking').value) || 0;
                const runTax  = getNumber(document.getElementById('run_tax').value) || 0;

                // ランニングコスト合計
                const runTotal = runMgmt + runRep + runPark + runTax;

                // 現在表示されている月々のご返済額（ローン）を取得
                const loanMonthly = getNumber(document.getElementById('res_monthly').innerText) || 0;

                // 総合計（ローン + ランニングコスト）を計算して表示
                const grandMonthly = loanMonthly + runTotal;
                document.getElementById('res_grand_monthly').innerText = grandMonthly.toLocaleString();
            } catch (e) {
                console.error("calcRunningCost error: ", e);
            }
        }
        window.onload = function() {
            const today = new Date();
            const dateStr = today.getFullYear() + "年" + (today.getMonth()+1) + "月" + today.getDate() + "日";
            document.getElementById('currentDate').innerText = dateStr;

            loadAppData();
            initExpenses();
            renderBankCards();
            initSimulator();
            
            const savedBankId = document.getElementById('sim_bank').value || 'hokuyo';
            setBank(savedBankId);
            
            const initialPrice = document.getElementById('propertyPrice').value;
            document.getElementById('globalPropertyPrice').value = initialPrice;
            
            setTimeout(() => {
                calcTotal();
                calculateLoan(true);
            }, 500); 
        };