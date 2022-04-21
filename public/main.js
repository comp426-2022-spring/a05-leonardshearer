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
    fetch(document.baseURI + 'app/flip/')
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
const multiflip = document.getElementById('multiflip')
multiflip.addEventListener('submit', flipCoins)

async function flipCoins(event) {
    event.preventDefault()
    const url = document.baseURI + 'app/flip/coins'
    try {
        const formData = new FormData(event.currentTarget)
        const result = await runFlips({ url, formData })
        console.log(result)

        document.getElementById('multisummary').innerHTML = '<strong>Summary</strong><br>Heads: ' + result.summary.heads + ' Tails: ' + result.summary.tails

        const flips = result.raw
        var table = '<br><br><table><tr><th>Flip Number</th><th>Result</th></tr>'
        for (var i = 0; i < flips.length; i++) {
            table = table + '<tr><th>' + i + '</th><th><img src=\'./assets/img/' + flips[i] + '.png\'></th></tr>'
        }
        table = table + '</table>'
        document.getElementById('multitable').innerHTML = table
    } catch (error) {
        console.log(error)
    }
}

async function runFlips({ url, formData }) {
    const formDataJson = JSON.stringify(Object.fromEntries(formData.entries()))
    const body = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
        },
        body: formDataJson
    }

    const response = await fetch(url, body)
    return response.json()
}

// Guess a flip by clicking either heads or tails button
