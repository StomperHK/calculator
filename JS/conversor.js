import {CreateCustomSelect} from "./custom-select.js"


(function() {
    const allOptionsContainerEL = Array.from(document.querySelectorAll('[data-js="options-container"]'))

    const customAlertEL = document.querySelector('.alert')
    const customAlertInnerContent = document.querySelector('[data-js="error-description"]')
    const customAlertOculterEL = document.querySelector('.alert button, .alert > div > div')

    const currencyInputEL = document.querySelector('[data-js="currency-input"]')
    const conversionResultEL = document.querySelector('[data-js="currency-result"]')
    const currenciesSwitcherEL = document.querySelector('[data-js="fa-sync-alt"]')
    const essentialConversionEL = document.querySelector('[data-js="essential-currency-conversion"]')
    const essentialConversionUnderlineEL = document.querySelector('[data-ja="currency-underline"]')

    let totalRotatorClicks = 1
    
    let firstSelect;
    let secondSelect;
    let firstCurrency;
    let secondCurrency;
    
    let globalExchangeRate = {}
    const APIKey = ''

    const getURL = currency => `https://v6.exchangerate-api.com/v6/${APIKey}/latest/${currency}`
    const errorDescription = errorType => ({
        "unsupported-code": "Este tipo de moeda base não é suportada.",
        "base-code-only-on-pro": "A moeda base especificada não é suportada no atual plano grátis.",
        "malformed-request": "Requisição HTTP malformada.",
        "invalid-key": "A chave de acesso da API é inválida.",
        "quota-reached": "Limite de requisições ultrapassado.",
        "not-available-on-plan": "Tipo de requisição não permitido neste plano."
    })[errorType] || "Os dados não poderam ser obtidos."


    async function fetchExchangeRate(currency) {
        return fetch(getURL(currency))
        .then(response => {
            if (!response.ok) {
                throw new Error(`Mal estado HTTP (${response.status}).`)
            }
            return response.json()
        })
        .then(parsedResponse => {
            if (parsedResponse.result === "error") {
                throw new Error(errorDescription(parsedResponse['error-type']))
            }
            return parsedResponse
        })
        .catch(error => {
            activeCustomAlert(error)
        })
    }


    const ocultCustomAlert = () => customAlertEL.classList.remove("active-custom-alert")

    function activeCustomAlert(error) {
        if (error.message === 'Failed to fetch') {
            error.message = 'Houve um problema. Verifique a sua conexão e tente novamente.'
        }
        customAlertInnerContent.innerText = error.message[error.message.length-1] === '.' ? 
                                            error.message :
                                            error.message + '.'
        customAlertEL.classList.add('active-custom-alert')
        customAlertOculterEL.addEventListener('click', ocultCustomAlert)
    }


    const fillContainerOptions = (optionsContainer, currencies) => {
        optionsContainer.innerHTML += currencies
    }

    function switchOptions() {
        this.style.transform = `rotate(${180*totalRotatorClicks}deg)`
        totalRotatorClicks++

        firstSelect._selectedOption.innerText = secondCurrency
        secondSelect._selectedOption.innerText = firstCurrency

        updateExchangeRate()
    }

    const setUpdateTime = (unixTimestamp, updateType) => {
        const formateDate = (dateInArray, joinSymbol) => {
            dateInArray = dateInArray.map(element => String(element))
            dateInArray = dateInArray.map(element => {
                return element.length === 1 ?
                '0' + element :
                element
            })

            return dateInArray.join(joinSymbol)
        }
        
        const date = new Date(unixTimestamp*1000)
        const calendar = formateDate([date.getDate(), date.getMonth()+1, date.getFullYear()], '/')
        const time = formateDate([date.getHours(), date.getMinutes()], ':')

        const containerUpdateEL = document.querySelector(`[data-container="${updateType}"]`)
        const calendarEL = document.querySelector(`[data-calendar="${updateType}"]`)
        const timeEL = document.querySelector(`[data-time="${updateType}"]`)

        const calendarSpanEL = document.createElement('span')
        const timeSpanEL = document.createElement('span')
        calendarSpanEL.innerText = calendar
        timeSpanEL.innerText = time

        calendarEL.appendChild(calendarSpanEL)
        timeEL.appendChild(timeSpanEL)
        containerUpdateEL.classList.remove('display-none')
    }

    function initApplicationStructure(currency, APIObject) {
        globalExchangeRate[currency] = {...APIObject['conversion_rates']}

        const currencies = Object.keys(globalExchangeRate[currency])
            .map(allCurrencies => `<li>${allCurrencies}</li>`)    // wrap the values with a span element.
            .join('')
        
        allOptionsContainerEL.forEach(container => fillContainerOptions(container, currencies))

        firstSelect = new CreateCustomSelect('.first-select')
        secondSelect = new CreateCustomSelect('.second-select', 'BRL')
        firstCurrency = firstSelect._selectedOption.innerText
        secondCurrency = secondSelect._selectedOption.innerText

        const secondCurrencyValue = Number(globalExchangeRate[firstCurrency][secondCurrency])
        
        firstSelect._allOptionsContainer.addEventListener('click', updateExchangeRate)
        secondSelect._allOptionsContainer.addEventListener('click', updateConversionResult)
        currencyInputEL.addEventListener('input', handleInput)
        currenciesSwitcherEL.addEventListener('click', switchOptions)
        
        essentialConversionEL.innerHTML = `1 ${firstCurrency} <span>=</span> ${formatDecimalPlaces(secondCurrencyValue, 4)} ${secondCurrency}`
        essentialConversionUnderlineEL.style.width = '100%'

        setUpdateTime(APIObject['time_last_update_unix'], 'last-update')
        setUpdateTime(APIObject['time_next_update_unix'], 'next-update')
    }
    
    function initFirstFetch(currency) {
        fetchExchangeRate(currency)
        .then(APIObject => {
            if (APIObject && APIObject['conversion_rates']) {
                initApplicationStructure(currency, APIObject)
            }
        })
    }
    

    initFirstFetch('USD')

    
    function handleInput() {
        let keyboardValue = this.value.replace(/\./, ',')
        let lastPositionOfCursor = currencyInputEL.selectionStart
        const firstIndexOfComma = keyboardValue.indexOf(',')
        const matchOfCommas = (keyboardValue.match(/\,/g) || '').length

        keyboardValue = keyboardValue.replace(/-/g, '')
        keyboardValue = keyboardValue.replace(/ /g, '')
        
        if (keyboardValue[0] == ',') {
            keyboardValue = '0' + keyboardValue
        }
        
        if (matchOfCommas > 1) {
            keyboardValue = [
                keyboardValue.slice(0, firstIndexOfComma+1),
                keyboardValue.slice(firstIndexOfComma).replace(/\,/g, '')
            ].join('')
            --lastPositionOfCursor
        }

        this.value = keyboardValue
        currencyInputEL.setSelectionRange(lastPositionOfCursor, lastPositionOfCursor)
        
        updateConversionResult(false)
    }
    

    function formatDecimalPlaces(number, decimalPlaces=2) {
        let arrayOfNumbers = Array.from(String(number))
        const indexOfDot = arrayOfNumbers.indexOf('.')

        while (arrayOfNumbers[arrayOfNumbers.length-1] === '0') {
            arrayOfNumbers.pop()
        }

        if (number % 1 !== 0) {
            if (arrayOfNumbers[indexOfDot+1] != '0') {
                const placesAfterTheDot = arrayOfNumbers.slice(indexOfDot+1).length

                placesAfterTheDot < decimalPlaces ?
                decimalPlaces = placesAfterTheDot :
                decimalPlaces = decimalPlaces
                
                arrayOfNumbers = arrayOfNumbers.slice(0, indexOfDot + decimalPlaces+1)

                return arrayOfNumbers.join('') + (decimalPlaces === 1 ? '0' : '')
            }

            else if (arrayOfNumbers[indexOfDot+1] === '0') {
                let arrayCopy = arrayOfNumbers.slice()
                let lastIndexOfZero = arrayCopy.lastIndexOf('0')
                const getAValidDecimalPlace = () => (arrayOfNumbers[lastIndexOfZero+2] ? 3 : 2)

                while (!(Number(arrayCopy.slice(indexOfDot, lastIndexOfZero+1).join('')) === 0)) {
                    arrayCopy.splice(lastIndexOfZero, 1)
                    lastIndexOfZero = arrayCopy.lastIndexOf('0')
                }

                return arrayOfNumbers.slice(0, lastIndexOfZero + getAValidDecimalPlace()).join('')
            }
        }
        return String(number)
    }
    
    function updateConversionResult(updateEssentialConversion=true) {
        firstCurrency = firstSelect._selectedOption.innerText
        secondCurrency = secondSelect._selectedOption.innerText

        const numberInputValue = Number(currencyInputEL.value.replace(',', '.'))
        const secondCurrencyValue = Number(globalExchangeRate[firstCurrency][secondCurrency])
        const finalResult = numberInputValue ? numberInputValue * secondCurrencyValue : 0

        conversionResultEL.value = finalResult ? formatDecimalPlaces(finalResult) : ''

        if (updateEssentialConversion) {
            essentialConversionEL.innerHTML = `1 ${firstCurrency} <span>=</span> ${formatDecimalPlaces(secondCurrencyValue, 4)} ${secondCurrency}`
        }
    }
    
    function updateExchangeRate() {
        firstCurrency = firstSelect._selectedOption.innerText
        
        if (!globalExchangeRate[firstCurrency]) {
            fetchExchangeRate(firstCurrency)
            .then(APIObject => {
                globalExchangeRate[firstCurrency] = {...APIObject['conversion_rates']}
                updateConversionResult()
            })
        }
        else {
            updateConversionResult()
        }
    }
})()
