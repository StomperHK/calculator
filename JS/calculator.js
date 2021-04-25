(function() {
    const calculatorFormEL = document.querySelector('[data-js="calculator-form"]')
    const calculatorEssentialExpressionEL = document.querySelector('[data-js="calculator-essential-expression"]')
    const calculatorResultDisplayEL = document.querySelector('[data-js="calculator-result-display"]')
    const displayableValuesELs = Array.from(document.querySelectorAll('[data-js="container-of-displayable-values"] > div'))

    const displayPopperEL = document.querySelector('[data-js="display-popper"]')
    const displayContentReseterEL = document.querySelector('[data-js="display-content-reseter"]')

    const maxAmountOfDecimalPlacesEL = document.querySelector('[data-js="max-decimal-places-quantity"]')

    const simbols = ["-", "+", "÷", "×", '*', '/']
    let globalInputResultLength = 0


    function doFundamentalsVerifications() {
        let displayContent = calculatorResultDisplayEL.value
        const indexOfInfinitySymbol = displayContent.indexOf('∞')

        if (indexOfInfinitySymbol !== -1) {
            displayContent = displayContent.split('')
            displayContent.splice(indexOfInfinitySymbol, 1)
            calculatorResultDisplayEL.value = displayContent.join('')
        }

        if (!displayContent) {
            calculatorEssentialExpressionEL.value = ''
        }
    }

    const handleCalculatorInput = () => {
        doFundamentalsVerifications()

        let lastPositionOfCursor = calculatorResultDisplayEL.selectionStart
        calculatorResultDisplayEL.value = formatDisplayInput(calculatorResultDisplayEL.value)
        calculatorResultDisplayEL.focus()

        let displayContent = calculatorResultDisplayEL.value

        if (displayContent.length === globalInputResultLength && displayContent.length !== 0 && displayContent.includes(',')) {
            lastPositionOfCursor--
        }
        calculatorResultDisplayEL.setSelectionRange(lastPositionOfCursor, lastPositionOfCursor)

        globalInputResultLength = displayContent.length
    }

    const handleButtonClick = event => {
        doFundamentalsVerifications()

        const contentOfClickedButton = event.target.innerText
        let displayContent = calculatorResultDisplayEL.value
        let lastPositionOfCursor = calculatorResultDisplayEL.selectionStart
        let slicedContent = [displayContent.slice(0, lastPositionOfCursor), displayContent.slice(lastPositionOfCursor)]

        calculatorResultDisplayEL.value = slicedContent.join(contentOfClickedButton.length === 1 ? contentOfClickedButton : '') // It need to be used, else the display can show a lot of values dependind of the user behaviour
        calculatorResultDisplayEL.value = formatDisplayInput(calculatorResultDisplayEL.value)
        calculatorResultDisplayEL.focus()

        if (displayContent.length === globalInputResultLength && displayContent.length !== 0 && displayContent.includes(',')) {
            --lastPositionOfCursor
        }

        calculatorResultDisplayEL.setSelectionRange(lastPositionOfCursor+1, lastPositionOfCursor+1)
    }


    const separeteNumbersFromOperators = arrayOfCharacters => {
        let elementPosition = 0

        return arrayOfCharacters.reduce((accumulator, character) => {
            if (!simbols.includes(character)) {
                accumulator[elementPosition] += character
                return accumulator
            }
            else {
                if (accumulator.indexOf("") != -1) {
                    accumulator[accumulator.indexOf("")] += character   
                    elementPosition++
                }
                else {
                    accumulator.push('')
                    accumulator[accumulator.indexOf('')] += character
                    elementPosition += 2
                }
                accumulator.push('')
                return accumulator
            }
        }, [''])
    }

    const removeLeandingZeros = (arrayOfCharacters) => {
        return arrayOfCharacters.map((innerStringWithCharacters) => {
            if (innerStringWithCharacters[0] == '0' && innerStringWithCharacters.length !== 1 &&
            innerStringWithCharacters[1] !== ',') {
                innerStringWithCharacters = innerStringWithCharacters.split('')
                innerStringWithCharacters.shift()
                return innerStringWithCharacters.join('')
            }
            else {
                return innerStringWithCharacters
            }
        })
    }

    const removeAddtionalCommas = arrayOfCharacters => {
        return arrayOfCharacters.map(innerStringWithCharacters => {
            innerStringWithCharacters = innerStringWithCharacters.replace(/\./g, ',')
            const indexOfComma = innerStringWithCharacters.indexOf(',')

            if (indexOfComma != -1) {
                return `${innerStringWithCharacters.slice(0, indexOfComma)},${innerStringWithCharacters.slice(indexOfComma).replace(/\,/g, '')}`
            }
            
            return innerStringWithCharacters
        })
    }

    const removeRepeatedOperators = arrayOfCharacters => {
        let thereIsASimbolBefore = false

        return arrayOfCharacters.filter((innerStringWithCharacters, stringIndex, array) => {
            if (thereIsASimbolBefore && thereIsASimbolBefore != "-" && innerStringWithCharacters == "-") {
                thereIsASimbolBefore = innerStringWithCharacters
                return true
            }
            else if (thereIsASimbolBefore && simbols.includes(innerStringWithCharacters)) {
                return false
            }
            else if (simbols.includes(innerStringWithCharacters) && simbols.slice(1).includes(array[stringIndex+1])) {
                return false
            }
            else if (simbols.includes(innerStringWithCharacters) && !thereIsASimbolBefore) {
                thereIsASimbolBefore = innerStringWithCharacters
                return true
            }
            else if (!simbols.includes(innerStringWithCharacters)) {
                thereIsASimbolBefore = false
                return true
            }
        })
    }
    
    function formatDisplayInput(stringOfCharacters) {
        arrayOfCharacters = stringOfCharacters.split('')
        
        let parsedExpression = separeteNumbersFromOperators(arrayOfCharacters)
        
        if (parsedExpression[parsedExpression.length-1] == "") {
            parsedExpression.pop()
        }

        
        parsedExpression = removeAddtionalCommas(parsedExpression)
        parsedExpression = removeLeandingZeros(parsedExpression)
        parsedExpression = removeRepeatedOperators(parsedExpression)
        
        if (simbols.slice(1).includes(parsedExpression[0])) {
            parsedExpression.shift()
        }
        
        return parsedExpression.join('')
    }


    function setBorderClassOnElements(Elements) {
        displayableValuesELs.slice(4).forEach((element, elementIndex) => {
            if ('741,C'.includes(element.innerText)) {
                element.classList.add('border-left-removed')
            }
            else if ('963'.includes(element.innerText)) {
                element.classList.add('border-right-removed')
            }
            else {
                element.classList.add('full-border')
            }
        })
        return
    }

    setBorderClassOnElements()


    if (sessionStorage.getItem('max-amount-of-decimal-places')) {
        maxAmountOfDecimalPlacesEL.value = sessionStorage.getItem('max-amount-of-decimal-places')
    }
    else {
        maxAmountOfDecimalPlacesEL.value = '9'
    }
    

    function formatDecimalPlaces(number, decimalPlaces=2) {
        let arrayOfNumbers = Array.from(String(number))
        const indexOfDot = arrayOfNumbers.indexOf('.')

        if (indexOfDot != -1) {
            const placesAfterTheDot = arrayOfNumbers.slice(indexOfDot+1).length

            placesAfterTheDot < decimalPlaces ?
            decimalPlaces = placesAfterTheDot :
            decimalPlaces = decimalPlaces
            
            arrayOfNumbers = arrayOfNumbers.slice(0, indexOfDot + decimalPlaces+1)

            return arrayOfNumbers.join('')
        }

        return String(number)
    }

    function displayExpressionResult(event) {
        event.preventDefault()
        
        let calculatorContentAsArray = calculatorResultDisplayEL.value.split('')
        
        while (simbols.includes(calculatorContentAsArray[calculatorContentAsArray.length-1])) {
            calculatorContentAsArray.pop()
        }
        
        calculatorContentAsString = calculatorContentAsArray.join('')
        calculatorEssentialExpressionEL.value = calculatorContentAsString + (calculatorContentAsString ? ' =' : '')
        
        calculatorContentAsString = calculatorContentAsString.replace(/÷/g, "/").replace(/×/g, "*").replace(/\./g, '').replace(/,/g, '.')
        
        if (calculatorContentAsString == '') {
            return
        }
        
        try {
            calculatorContentAsString = formatDecimalPlaces(eval(calculatorContentAsString), Number(maxAmountOfDecimalPlacesEL.value))
        }
        catch {
            calculatorResultDisplayEL.value = ''
            return
        }
        
        if (calculatorContentAsString == Infinity || calculatorContentAsString == -Infinity) {
            calculatorContentAsString = "∞"
        }
        
        calculatorResultDisplayEL.value = formatDisplayInput(String(calculatorContentAsString).replace(".", ","))
    }


    calculatorResultDisplayEL.addEventListener('input', handleCalculatorInput)

    calculatorResultDisplayEL.addEventListener('keydown', (event) => {
        if (event.key === 'Backspace') {
            if (!calculatorResultDisplayEL.value) {
                calculatorEssentialExpressionEL.value = ''
            }
        }
    })

    displayableValuesELs.forEach(divElement => divElement.addEventListener('click', handleButtonClick))
    
    calculatorFormEL.addEventListener("submit", displayExpressionResult)
    
    displayPopperEL.addEventListener("click", () => {
        let offSetForEnd = 0
        let displayContent = calculatorResultDisplayEL.value.split('')
        let selectionStart = calculatorResultDisplayEL.selectionStart
        let selectionEnd = calculatorResultDisplayEL.selectionEnd
        
        if (selectionStart !== 0 || selectionEnd !== 0) {
            selectionStart -= selectionStart === selectionEnd ? 1 : 0       // returning one place to delete
            displayContent.splice(selectionStart, selectionEnd-selectionStart) // removing selected numbers
            calculatorResultDisplayEL.value = displayContent.join('')

            doFundamentalsVerifications()

            selectionStart += selectionStart+1 === selectionEnd ? 1 : 0
        }
        else if (selectionStart + selectionEnd === 0) {
            return undefined
        }

        if (selectionStart == selectionEnd) {   // if truth, it means it's needed to compesate deletion
            offSetForEnd = 1
        }
        else {
            offSetForEnd = 0
        }

        calculatorResultDisplayEL.value = formatDisplayInput(calculatorResultDisplayEL.value)
        calculatorResultDisplayEL.setSelectionRange(selectionStart, selectionStart-offSetForEnd)
        calculatorResultDisplayEL.focus()

        globalInputResultLength = calculatorResultDisplayEL.value
    })
    
    displayContentReseterEL.addEventListener("click", () => {
        calculatorEssentialExpressionEL.value = ""
        calculatorResultDisplayEL.value = ""
        calculatorResultDisplayEL.focus()
    })

    maxAmountOfDecimalPlacesEL.addEventListener('input', () => {
        inputContent = maxAmountOfDecimalPlacesEL.value.replace(/\./, '').replace(/,/, '')

        if (Number(inputContent)) {
            maxAmountOfDecimalPlacesEL.value = inputContent
            sessionStorage.setItem('max-amount-of-decimal-places', inputContent)
        }
        else {
            maxAmountOfDecimalPlacesEL.value = ''
        }
    })
})()
