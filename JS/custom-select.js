export class CreateCustomSelect {
    constructor(container, optionDisplayed=undefined) {
        this._clicks = 0
        this._optionFilter = optionDisplayed
    
        this._container = document.querySelector(container)
        this._firstDiv = document.querySelector(`${container} > div`)
        this._selectedOption = document.querySelector(`${container} > div > span`)
        this._selectChevron = document.querySelectorAll(`${container} > div > span`)[1]
        this._filterBoxReseter = document.querySelector(`${container} .custom-x-simbol`)
        this._allOptionsContainer = document.querySelector(`${container} > div:nth-child(2)`)
        this._filterBox = document.querySelector(`${container} > div:nth-child(2) input`)
        
        this._allOptions = Array.from(document.querySelectorAll(`${container} > div:nth-child(2) ul li`))
        
        this.initializeSelect()
    }
    
    initializeSelect () {
        this.setSelectValue()
        this.addClickEvent()
        this.addInputEvent()
    }
    
    setSelectValue() {
        if (this._optionFilter) {
            for (let option of this._allOptions) {
                if (option.innerText == this._optionFilter) {
                    return this._selectedOption.innerText = this._optionFilter
                }
            }
        }

        if (this._allOptions[0]) {
            this._selectedOption.innerText = this._allOptions[0].innerText
        }
    }
    
    addClickEvent() {
        document.addEventListener("click", this.verifyWhatWasClicked.bind(this))
        this._allOptions.forEach(option => {
            option.addEventListener("click", () => this.selectOption(option))
        })
        this._firstDiv.addEventListener("click", this.addaptSelectOnClick.bind(this))
        this._filterBoxReseter.addEventListener("click", this.resetFilterBox.bind(this))
    }
    
    verifyWhatWasClicked(event) {
        if ( !(this._container.contains(event.target)) && this._clicks == 1) {
            this.addaptSelectOnClick()
        }
    }
    
    selectOption(option) {
        this._selectedOption.innerText = option.innerText
    }
    
    addaptSelectOnClick() {
        switch (this._clicks) {
            case 0:
                this._selectChevron.classList.add("rotate-chevron")
                this._allOptionsContainer.classList.remove("disable-option-container")
                ++this._clicks
                break
            case 1:
                this._selectChevron.classList.remove("rotate-chevron")
                this._allOptionsContainer.classList.add("disable-option-container")
                --this._clicks
                break
        }
    }
    
    addInputEvent() {
        this._filterBox.addEventListener('input', this.filterOptions.bind(this))
        this.showFilterReseter(this._filterBox.value)
    }
    
    resetFilterBox() {
        this._filterBox.value = ""
        
        this._filterBoxReseter.classList.add("hide-input-reseter")
        
        this.showFilterReseter(this._filterBox.value)
        this.filterOptions()
    }
    
    filterOptions() {
        const currentInputContent = this._filterBox.value.toLowerCase()
        
        this._allOptions.forEach(option => {
            if (option.innerText.toLowerCase().includes(currentInputContent)) {
                option.style.display = "block"
            } else {
                option.style.display = "none"
            }
        })
        
        this.showFilterReseter(currentInputContent)
    }
    
    showFilterReseter(currentInputContent) {
        if (currentInputContent != '') {
            this._filterBoxReseter.classList.remove("hide-input-reseter")
        } else {
            this._filterBoxReseter.classList.add("hide-input-reseter")
        }
    }
}
