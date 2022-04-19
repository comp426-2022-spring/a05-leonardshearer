// Focus div based on nav button click
function selectDiv(div) {
    document.getElementById('home').classList.add('hidden')
    document.getElementById('single').classList.add('hidden')
    document.getElementById('multi').classList.add('hidden')
    document.getElementById('guess').classList.add('hidden')
    document.getElementById(div).classList.remove('hidden')
}

// Flip one coin and show coin image to match result when button clicked
function flipCoin() {
    fetch('http://localhost:5555/app/flip')
        .then(function (response) {
            return response.json()
        })
        .then(function (result) {
            document.getElementById('singleresult').innerHTML = result.flip
            document.getElementById('singlepic').setAttribute('src', './assets/img/' + result.flip + '.png')
        })
}

// Flip multiple coins and show coin images in table as well as summary results
// Enter number and press button to activate coin flip series

// Guess a flip by clicking either heads or tails button
