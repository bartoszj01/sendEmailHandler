({
    initCmp : function(component) {
        this.setSpinner(component, true);
        var action = component.get("c.initComponent");
        action.setParams({oppId: component.get("v.recordId")});
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (component.isValid() && state === "SUCCESS") {
                var controller = response.getReturnValue();
                this.updateSelectOptions(controller.orderInpDefVal);
                component.set("v.apexCtrl", controller);
            } else {
                var errors = response.getError();
                if (errors && errors[0] && errors[0].message) {
                    this.showMessage(component, "error", errors[0].message);
                }
            }
            this.setSpinner(component, false);
        });
        $A.enqueueAction(action);
    },

    refreshCmp : function(component) {
        this.setSpinner(component, true);

        var controller = component.get("v.apexCtrl");
        controller.orderInpDefVal.forEach(function (val) {
            val.item["Value__c"] = val.objValue.value;
            delete val.options;
        });

        var action = component.get("c.refreshComponent");
        action.setParams({ctrlJSON: JSON.stringify(controller)});
        //due to ui:inputSelect options length bug
        controller.orderInpDefVal.forEach(function (val) {
            val.options = [];
        });
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (component.isValid() && state === "SUCCESS") {
                var controller = response.getReturnValue();
                this.updateSelectOptions(controller.orderInpDefVal);
                component.set("v.apexCtrl", controller);
            } else {
                var errors = response.getError();
                if (errors && errors[0] && errors[0].message) {
                    this.showMessage(component, "error", errors[0].message);
                }
            }

            this.setSpinner(component, false);

        });
        $A.enqueueAction(action);
    },

    saveData : function(component) {
        this.setSpinner(component, true);

        var controller = component.get("v.apexCtrl");
        controller.orderInpDefVal.forEach(function (val) {
            val.item["Value__c"] = val.objValue.value;
            delete val.options;
        });

        var action = component.get("c.createContract");
        action.setParams({ctrlJSON: JSON.stringify(controller)});
        //due to ui:inputSelect options length bug
        controller.orderInpDefVal.forEach(function (val) {
           val.options = [];
        });
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (component.isValid() && state === "SUCCESS") {
                var controller = response.getReturnValue();
                this.updateSelectOptions(controller.orderInpDefVal);
                component.set("v.apexCtrl", controller);
                if (controller.contractCreated) {
                    this.showMessage(component, "success");
                    $A.get('e.force:refreshView').fire();
                } else {

                    this.showMessage(component, "info");
                }
            } else {
                var errors = response.getError();
                if (errors && errors[0] && errors[0].message) {
                    this.showMessage(component, "error", errors[0].message);
                }
            }
            this.setSpinner(component, false);
        });
        $A.enqueueAction(action);
    },

    showMessage : function(cmp, type, msg) {
        if (type == "success") {
            this.fireToast(cmp, $A.get("$Label.c.ContractCreatorFromOpp_SuccessMsgTitle"), $A.get("$Label.c.ContractCreatorFromOpp_SuccessMsgBody"), type);

        } else if (type == "info") {
            this.fireToast(cmp, $A.get("$Label.c.ContractCreatorFromOpp_InfoMsgTitle"), $A.get("$Label.c.ContractCreatorFromOpp_InfoMsgBody"), type);

        } else if (type == "error") {
            this.fireToast(cmp, $A.get("$Label.c.ContractCreatorFromOpp_ErrorMsgTitle"),  msg, type);
        }
    },

    fireToast : function(cmp, msgTitle, msgText, msgType) {
        var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            title: msgTitle,
            message: msgText,
            type: msgType,
            duration: 5000,
            mode: (msgType == "success") ? null : "sticky"
        });
        toastEvent.fire();
    },

    setSpinner : function(cmp, activate) {
        var spinner = cmp.find("spinner");
        if (!activate) {
            $A.util.addClass(spinner, "slds-hide");
        } else {
            $A.util.removeClass(spinner, "slds-hide");
        }
    },

    updateSelectOptions : function(orderInputDefinitionValues) {
        orderInputDefinitionValues.forEach( function(value) {
            if (value.type == 'PICKLIST' || value.type == 'MULTIPICKLIST') {
                var selectOptions = [];
                for(var s in value.options) {
                   selectOptions.push({label: value.options[s], value: s});
                }
                value.options = selectOptions;
            }
        });
        return orderInputDefinitionValues;
    }

})