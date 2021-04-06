(function() {
    const calculatorFormEL = document.querySelector('[data-js="calculator-form"]')
    const calculatorEssentialExpressionEL = document.querySelector('[data-js="calculator-essential-expression"]')
    const calculatorResultDisplayEL = document.querySelector('[data-js="calculator-result-display"]')
    const displayableValuesELs = Array.from(document.querySelectorAll('[data-js="container-of-displayable-values"] > div'))

    const displayPopperEL = document.querySelector('[data-js="display-popper"]')
    const displayContentReseterEL = document.querySelector('[data-js="display-content-reseter"]')

    const maxAmountOfDecimalPlacesEL = document.querySelector('[data-js="max-decimal-places-quantity"]')

    const simbols = ["-", "+", "÷", "×", '*', '/']
    let globalAmountOfDotsBeforeTheCursor = 0
    let globalInputResultLength = 0


    /* function maintainCursorPosition(selectionStart, displayContent) {
        const amountOfDotsBeforeTheCursor = (displayContent.slice(0, selectionStart).match(/\./g) || '').length

         if (globalAmountOfDotsBeforeTheCursor > amountOfDotsBeforeTheCursor) {
             selectionStart -= selectionStart === 0 ? 0 : 1
        }
        if (amountOfDotsBeforeTheCursor !== globalAmountOfDotsBeforeTheCursor && amountOfDotsBeforeTheCursor) {
            ++selectionStart
            console.log(amountOfDotsBeforeTheCursor)
        }
        globalAmountOfDotsBeforeTheCursor = amountOfDotsBeforeTheCursor

        calculatorResultDisplayEL.setSelectionRange(selectionStart, selectionStart)
    } */

    function doFundamentalsVerifications() {
        const indexOfInfinitySymbol = calculatorResultDisplayEL.value.indexOf('∞')
        const indexOfErrorMessage = calculatorResultDisplayEL.value.indexOf('Erro')
        let displayContent = calculatorResultDisplayEL.value

        if (indexOfInfinitySymbol !== -1) {
            displayContent = displayContent.split('')
            displayContent.splice(indexOfInfinitySymbol, 1)
            calculatorResultDisplayEL.value = displayContent.join('')
        }

        if (indexOfErrorMessage !== -1) {
            displayContent = displayContent.split('')
            displayContent.splice(indexOfErrorMessage, 4)
            calculatorResultDisplayEL.value = displayContent.join('')
            calculatorEssentialExpressionEL.innerText = ''
        }

        if (!displayContent) {
            calculatorEssentialExpressionEL.innerText = ''
            
        }
    }

    const handleCalculatorInput = () => {
        doFundamentalsVerifications()

        let lastPositionOfCursor = calculatorResultDisplayEL.selectionStart

        calculatorResultDisplayEL.value = formatDisplayInput(calculatorResultDisplayEL.value)
        calculatorResultDisplayEL.focus()

        displayContent = calculatorResultDisplayEL.value

        if (displayContent.length === globalInputResultLength) {
            --lastPositionOfCursor
        }
        calculatorResultDisplayEL.setSelectionRange(lastPositionOfCursor, lastPositionOfCursor)

        globalInputResultLength = displayContent.length
    }

    const handleButtonClick = event => {
        doFundamentalsVerifications()

        calculatorResultDisplayEL.focus()

        const contentOfClickedButton = event.target.innerText

        let lastPositionOfCursor = calculatorResultDisplayEL.selectionStart
        let displayContent = calculatorResultDisplayEL.value
        let slicedContent = [displayContent.slice(0, lastPositionOfCursor), displayContent.slice(lastPositionOfCursor)]

        calculatorResultDisplayEL.value = slicedContent.join(contentOfClickedButton.length === 1 ? contentOfClickedButton : '') // It need to be used, else the display can show a lot of values dependind of the user behaviour
        calculatorResultDisplayEL.value = formatDisplayInput(calculatorResultDisplayEL.value)

        if (displayContent.length === globalInputResultLength && displayContent.length !== 0) {
            --lastPositionOfCursor
        }
        calculatorResultDisplayEL.setSelectionRange(++lastPositionOfCursor, lastPositionOfCursor)   
    }


    /* function separateNumericalPlacesWithDot(completeNumber) {
        completeNumber =  completeNumber.replace(/\./g, '')

        if (Number(completeNumber) === NaN) {
            return completeNumber
        }

        let arrayOfNumbers = completeNumber.split('').reverse()        
        let amountOfDots = 0
        let arrayCopy = arrayOfNumbers.slice()


        arrayOfNumbers.forEach((_number, numberIndex) => {
            if (numberIndex % 3 === 0 && numberIndex != 0) {
                arrayCopy.splice(numberIndex + amountOfDots, 0, '.')
                ++amountOfDots
            }
        })

        return arrayCopy.reverse().join('')
    } */

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

    /* const verifyIfInnerElementsCanGetFormatedWithDot = arrayOfCharacters => {
        return arrayOfCharacters.map(innerStringWithCharacters => {
            innerStringWithCharacters = innerStringWithCharacters[0] == '0' && innerStringWithCharacters[1] != ',' ? 
            String(Number(innerStringWithCharacters)) :
            innerStringWithCharacters
            
            if (!simbols.includes(innerStringWithCharacters) && String(innerStringWithCharacters).includes(',')) {
                const indexOfComma = innerStringWithCharacters.indexOf(',')

                return separateNumericalPlacesWithDot(innerStringWithCharacters.split(',')[0])
                    .concat(',', innerStringWithCharacters.slice(indexOfComma).replace(/\./g, '').replace(/,/g, ''))
            } else if (!simbols.includes(innerStringWithCharacters)) {
                return separateNumericalPlacesWithDot(innerStringWithCharacters)
            }

            return innerStringWithCharacters
        })
    } */

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

        // parsedExpression = verifyIfInnerElementsCanGetFormatedWithDot(parsedExpression)
        parsedExpression = removeAddtionalCommas(parsedExpression)
        parsedExpression = removeRepeatedOperators(parsedExpression)
        
        if (simbols.slice(1).includes(parsedExpression[0])) {
            parsedExpression.shift()
        }
        
        return parsedExpression.join('')
    }


    function setBorderClassOnElements(Elements) {
        displayableValuesELs.slice(4).forEach((element, elementIndex) => {
            if ('741,'.includes(element.innerText)) {
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
        
        const lastExpressionValue = calculatorEssentialExpressionEL.innerText
        let calculatorContentAsArray = calculatorResultDisplayEL.value.split('')
        
        while (simbols.includes(calculatorContentAsArray[calculatorContentAsArray.length-1])) {
            calculatorContentAsArray.pop()
        }
        
        calculatorContentAsString = calculatorContentAsArray.join('')
        calculatorEssentialExpressionEL.innerText = calculatorContentAsString
        
        calculatorContentAsString = calculatorContentAsString.replace(/÷/g, "/").replace(/×/g, "*").replace(/\./g, '').replace(/,/g, '.')
        
        if (calculatorContentAsString == '') {
            return
        }
        
        try {
            calculatorContentAsString = formatDecimalPlaces(eval(calculatorContentAsString), Number(maxAmountOfDecimalPlacesEL.value))
        }
        catch {
            calculatorEssentialExpressionEL.value = calculatorContentAsString
            calculatorResultDisplayEL.value = 'Erro'
            return
        }
        
        if (calculatorContentAsString == Infinity || calculatorContentAsString == -Infinity) {
            calculatorContentAsString = "∞"
        }
        
        calculatorResultDisplayEL.value = formatDisplayInput(String(calculatorContentAsString).replace(".", ","))
    }


    calculatorResultDisplayEL.addEventListener('input', handleCalculatorInput)
    displayableValuesELs.forEach(divElement => divElement.addEventListener('click', handleButtonClick))
    
    calculatorFormEL.addEventListener("submit", displayExpressionResult)
    
    displayPopperEL.addEventListener("click", () => {
        calculatorResultDisplayEL.focus()

        let displayContent = calculatorResultDisplayEL.value.split('')
        let lastPositionOfCursor = calculatorResultDisplayEL.selectionStart
        
        displayContent.splice(lastPositionOfCursor-1, 1)
        calculatorResultDisplayEL.value = displayContent.join('')

        doFundamentalsVerifications()

        calculatorResultDisplayEL.value = formatDisplayInput(calculatorResultDisplayEL.value)
        calculatorResultDisplayEL.setSelectionRange(lastPositionOfCursor, --lastPositionOfCursor)
    })
    
    displayContentReseterEL.addEventListener("click", () => {
        calculatorResultDisplayEL.value = ""
        calculatorEssentialExpressionEL.innerText = ""
    })

    maxAmountOfDecimalPlacesEL.addEventListener('input', () => {
        inputContent = maxAmountOfDecimalPlacesEL.value.replace(/\./, '').replace(/,/, '')

        if (Number(inputContent)) {
            inputContent = inputContent
            maxAmountOfDecimalPlacesEL.value = inputContent

            sessionStorage.setItem('max-amount-of-decimal-places', inputContent)
        }
        else {
            maxAmountOfDecimalPlacesEL.value = ''
        }
    })
})()
