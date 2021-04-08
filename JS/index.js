(function() {
    const themeSwitcherEL = document.querySelector('#check-switch')
    const hamburguerMenuOpenerEL = document.querySelector('[data-js="hamburguer-menu-opener"]')
    const hamburguerMenuCloserEL = document.querySelector('[data-js="hamburguer-menu-closer"]')
    const navigationBarEL = document.querySelector('header > nav')
    const hamburguerMenuCloserShortcutEL = document.querySelector('[data-js="hamburguer-menu-closer-shortcut"]')
    
    
    if (localStorage.getItem("theme-color") == "true") {
        document.querySelector('html').classList.add('dark-theme')
        themeSwitcherEL.checked = true
    }
    else {
        document.querySelector('html').classList.remove('dark-theme')
        themeSwitcherEL.checked = false
    }
    

    hamburguerMenuOpenerEL.addEventListener("click", () => {
        navigationBarEL.classList.add('active-hamburguer-menu')

        hamburguerMenuCloserShortcutEL.classList.add('expand-menu-closer-shortcut')
        hamburguerMenuCloserShortcutEL.style.display = 'block'
        
        hamburguerMenuCloserShortcutEL.classList.add('opacity')
        hamburguerMenuCloserShortcutEL.style.pointerEvents = "auto"

        hamburguerMenuCloserShortcutEL.addEventListener('click', () => {
            navigationBarEL.classList.remove('active-hamburguer-menu')
            
            hamburguerMenuCloserShortcutEL.classList.remove('opacity')
            hamburguerMenuCloserShortcutEL.style.pointerEvents = "none"            
        })
    })

    hamburguerMenuCloserEL.addEventListener("click", () => {
        navigationBarEL.classList.remove('active-hamburguer-menu')

        hamburguerMenuCloserShortcutEL.classList.remove('opacity')
        hamburguerMenuCloserShortcutEL.style.pointerEvents = "none"            
    })

    themeSwitcherEL.addEventListener("click", () => {
        document.querySelector('html').classList.toggle('dark-theme')
        localStorage.setItem("theme-color", themeSwitcherEL.checked)
    })
})()
