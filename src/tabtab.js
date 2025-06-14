

function Tabtab(selector, options = {}) {
    this.container = document.querySelector(selector);
    if(!this.container) {
        console.error(`Tabtab: Container with selector "${selector}" not found.`);
        return;
    }

    this.tabs = Array.from(this.container.querySelectorAll("li a"));
    if(!this.tabs.length) {
        console.error(`Tabtab: No tabs found in the container`);
        return;
    };

    this.panels = this.tabs.map(tab => {
        const panel = document.querySelector(tab.getAttribute("href"));
        if(!panel) {
            console.error(`Tabtab: Panel with href "${tab.getAttribute("href")}" not found.`);
        }
        return panel
    }).filter(Boolean)

    if(this.tabs.length !== this.panels.length) return;

    this.opt = Object.assign({
        activeClassName: "tabs--active",
        remember : false,
        onChange: null,
    },options)
    this._cleanRegex = /[^a-zA-Z0-9]/g
    this.paramKey = selector.replace(this._cleanRegex, "");
    this._init()

};

Tabtab.prototype._init = function() {
    
    const params = new URLSearchParams(window.location.search);
    let value = params.get(this.paramKey);
    
    const defaultTab = 
        (this.opt.remember && value && this.tabs.find(tab => tab.getAttribute("href").replace(this._cleanRegex, "") === value)) || this.tabs[0]
    this._currentTab = defaultTab

    this._activateTab(defaultTab, false, false);

    this.tabs.forEach(tab => {
        tab.onclick = (e) => {
            e.preventDefault();
            this.tryActiveTab(tab);
        }
    })
};

Tabtab.prototype.tryActiveTab = function(tab) {
    if(this._currentTab !== tab) {
        this._currentTab = tab;
        this._activateTab(tab);
    }
};

Tabtab.prototype._activateTab = function(tab, triggeronChange = true, updatUrl = this.opt.remember) {
    this.tabs.forEach(tab => {
        tab.closest("li").classList.remove(this.opt.activeClassName)
    })
    tab.closest("li").classList.add(this.opt.activeClassName)

    this.panels.forEach(panel => panel.hidden = true);
    const panelActive = document.querySelector(`${tab.getAttribute("href")}`)
    panelActive.hidden = false;
    
    if(updatUrl) {
        const params = new URLSearchParams(window.location.search);
        params.set(this.paramKey, tab.getAttribute("href").replace(this._cleanRegex, ""));

        history.replaceState(null,null, `?${params}`);
    }
    if(triggeronChange && typeof this.opt.onChange === "function") {
                this.opt.onChange({
                    tab,
                    panel: panelActive,})
    }
};


Tabtab.prototype.switch = function(input) {
    let tabToActivate = null;

    if(typeof input === "string") {
        tabToActivate =  this.tabs.find(tab => {
            return tab.getAttribute("href") === input;
            ;
        })
    }
    else if (this.tabs.includes(input)) {
        tabToActivate = input
    }
    
    if(!tabToActivate) {
        console.error(`Tabtab: No vailid input '${input}'`);
        return;
    }
    this.tryActiveTab(tabToActivate);
};

Tabtab.prototype.destroy = function() {
    this.tabs.forEach(tab => {
        tab.onclick = null;
        tab.closest("li").classList.remove(this.opt.activeClassName);
    });
    this.panels.forEach(panel => panel.hidden = false);
    this.container = null;
    this.tabs = null;
    this.panels = null;
    this._currentTab = null;
    
};


