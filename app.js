var budgetController = (function() {
    
   var Expense = function(id, description, value) {
       this.id = id;
       this.description = description;
       this.value = value;
       this.percentage = -1;
   }
   Expense.prototype.calcPercentage = function(totalIncome) {
       if(totalIncome > 0) {
           this.percentage = Math.round((this.value / totalIncome) * 100);
       } else {
           this.percentage = -1;
       }
   }
   
   Expense.prototype.getPercentage = function() {
       return this.percentage;
   }
   
   var Income = function(id, description, value) {
       this.id = id;
       this.description = description;
       this.value = value;
   }
   
   var calculateTotal = function(type) {
       var sum = 0;
       data.allitem[type].forEach(function(current) {
           sum += current.value;
       });
       data.totals[type] = sum;
   }
   
   var data = {
       allitem: {
           inc: [],
           exp: []
       },
       totals: {
           inc: 0,
           exp: 0
       },
       budget: 0,
       percentage: -1
   }
   
   return {
       addItem: function(type, des, val) {
           var newItem, ID;
           if (data.allitem[type].length > 0) {
               ID = data.allitem[type][data.allitem[type].length - 1].id + 1; 
           } else {
               ID = 0;
           }
           if (type === 'exp') {
               newItem = new Expense(ID, des, val);
           } else {
               newItem = new Income(ID, des, val);
           }
           
           data.allitem[type].push(newItem);
           return newItem;
       },
       
       calculateBudget: function() {
           calculateTotal('inc');
           calculateTotal('exp');
           data.budget = data.totals.inc - data.totals.exp;
           if(data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
           } else {
               data.percentage = -1;
           }
       },
       
       getBudget: function() {
           return {
               budget: data.budget,
               totalInc: data.totals.inc,
               totalExp: data.totals.exp,
               percentage: data.percentage
           }
       },
       
       calculatePercentages: function() {
           data.allitem.exp.forEach(function(current) {
               current.calcPercentage(data.totals.inc);
           });
       },
       
       getPercentage: function() {
           var allPerc = data.allitem.exp.map(function(current) {
               return current.getPercentage();
           });
           return allPerc;
       },
       
       deleteItem: function(type, id) {
           var ids, index;
           ids = data.allitem[type].map(function(current) {
               return current.id;
           });
           index = ids.indexOf(id);
           if(index !== -1) {
               data.allitem[type].splice(index, 1);
           }
       },
       test: function() {
           return data;
       }
   };
    
})();

var UIController = (function() {
    
    DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };
    
    var formateNumber = function(num, type) {
        var splitNum, int, dec, sign;
        num = Math.abs(num);
        num = num.toFixed(2);
        splitNum = num.split('.');
        int = splitNum[0];
        dec = splitNum[1]; 
        if(int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length -3, 3);
        }
        type === 'exp' ? sign = '-' : sign = '+';
        return sign + ' ' + int + '.' + dec;
    };
    
    var nodeListForEach = function(list, callback) {
        for(var i=0;i<list.length;i++) {
            callback(list[i], i);
        }
    };
    
    return {
        getInput: function() {
            
            return {
                type: document.querySelector(DOMStrings.inputType).value,
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            }
        },
        
        addListItem: function(obj, type) {
            
            var html, newHtml, element;
            
            if(type === 'inc') {
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div> </div> </div>'
            } else if ( type === 'exp') {
                element = DOMStrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>'
            }
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formateNumber(obj.value, type));
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        
        clearFields: function() {
            var fields, fieldArr;
            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);
            fieldArr = Array.prototype.slice.call(fields);
            fieldArr.forEach(function(current, index, arr) {
                current.value = "";
            });
            fieldArr[0].focus();
        },
        
        displayBudget: function(obj) {
            
            document.querySelector(DOMStrings.budgetLabel).textContent = formateNumber(obj.budget, obj.budget >= 0 ? 'inc' : 'exp');
            document.querySelector(DOMStrings.incomeLabel).textContent = formateNumber(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.expenseLabel).textContent = formateNumber(obj.totalExp, 'exp');
            if(obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }
        },
        
        getDOMStrings: function() {
            return DOMStrings;
        },
        
        displayPercentages: function(percentages) {
            var fields = document.querySelectorAll(DOMStrings.expensesPercLabel);
            
            nodeListForEach(fields, function(current, index) {
                if(percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
            
        },
        
        displayMonth: function() {
            
            var now, year, month, months;
            now = new Date();
            months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year;
            
        },
        
        changedType: function() {
            var fields = document.querySelectorAll(DOMStrings.inputType + ',' + DOMStrings.inputDescription + ',' + DOMStrings.inputValue);
            nodeListForEach(fields, function(current) {
                current.classList.toggle('red-focus');    
            });
            document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
        },
        
        deleteListItem: function(selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        }
        
    };
    
})();

var controller = (function(budgetCtrl, UICtrl) {
    
    var setupEventListener = function() {
        var DOM = UICtrl.getDOMStrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function(event) {
            if (event.keyCode ===  13 || event.which === 13) {
                ctrlAddItem();
            }
        });
        
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };
    
    
    
    var updateBudget = function() {
        budgetCtrl.calculateBudget();
        var budget = budgetCtrl.getBudget();
//        console.log(budget);
        UICtrl.displayBudget(budget);
    }
    
    var updatePercentages = function() {
        budgetCtrl.calculatePercentages();
        var percentages = budgetCtrl.getPercentage();
//        console.log(percentages);
        UICtrl.displayPercentages(percentages);
    };
    
    //main
    var ctrlAddItem = function() {
        
        var input, newItem;
        input = UICtrl.getInput();
        
        if(input.description !== "" && !isNaN(input.value) && input.value > 0) {
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            UICtrl.addListItem(newItem, input.type);
            UICtrl.clearFields();
            updateBudget();
            updatePercentages();
        }
    
    };
    
    var ctrlDeleteItem = function(event) {
        var itemID, splitID, typr, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            budgetCtrl.deleteItem(type, ID);
            UICtrl.deleteListItem(itemID);
            updateBudget();
            updatePercentages();
        }
    }
    
    return {
        init: function() {
            console.log('Application has started!');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: 0
            });
            setupEventListener();
        }  
    };
    
})(budgetController, UIController); 

controller.init();