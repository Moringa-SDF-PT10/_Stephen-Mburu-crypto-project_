let coins = [];
let currentCoin = null;
let currentRound = 0
let score = 0
let guessedCoins = [];
let selectedCoins = [];


const gameArea = document.getElementById("gameArea");
const resultArea = document.getElementById("resultArea");
const finalScore = document.getElementById("finalScore");
const answers = document.getElementById("answers");
const startBtn = document.getElementById("startBtn");
const submitButton = document.getElementById("submitGuess");
const restartButton = document.getElementById("restartButton");
const hintDiv = document.getElementById("Hint");
const guessInput = document.getElementById("guessInput");
const feedback = document.getElementById("Feedback");
const roundsInfo = document.getElementById("roundsInfo");
//adds event listeners to the buttons
startBtn.addEventListener("click", () => {
    startBtn.classList.add("hidden");
    startTheChallenge();
});

async function loadCoins() {
    try {
        const res = await fetch(`https://api.coinpaprika.com/v1/coins`);
        if (!res.ok) throw new Error("Failed to fetch coins");
        return await res.json();
    } catch (error) {
        console.error(error);
        alert("Failed to load coins. Please try again later.");
    }
}

async function getCoinDetails(coinId) {
    try {
        const res = await fetch(`https://api.coinpaprika.com/v1/tickers/${coinId}`);
        if (!res.ok) throw new Error("Failed to fetch coin details");
        return await res.json();
    } catch (error) {
        console.error(error);
        alert("Failed to load coin details. Please try again later.");
    }

}
function showHint(coin) {
     const name = coin.name || "Unknown"; // Extract name
     const symbol = coin.symbol || "N/A"; // Extract symbol
     const rank = coin.rank || "?"; // Extract rank
     const firstLetter = name[0] || "N/A"; // Extract first letter
     const price = coin.quotes?.USD?.price
     ?coin.quotes.USD.price.toFixed(2): "N/A"; // Extract current price
     const marketCap = coin.quotes?.USD?.market_cap
     ? coin.quotes.USD.market_cap.toLocaleString(): "N/A"; // Extract market cap
     const launchYear = coin.started_at ? new Date(coin.started_at).getFullYear() : "Unknown"; // Extract launch year
     hintDiv.innerHTML = `
  <p><strong>Symbol:</strong> ${symbol}</p>
  <p><strong>rank:</strong> ${rank}</p>
  <p><strong>Current Price (USD):</strong> ${price}</p>
  <p><strong>Market Cap:</strong> ${marketCap}</p>
  <p><strong>first letter:</strong> ${firstLetter}</p>
  <p><strong>Launch Year:</strong> ${launchYear}</p>
  `;
}
async function nextRound() {
    currentCoin = selectedCoins[currentRound]
    const coinDetails = await getCoinDetails(currentCoin.id)
    console.log(coinDetails)
    currentCoin.details = coinDetails
    roundsInfo.innerText = `Round ${currentRound + 1} of 3`
    showHint(coinDetails)
    guessInput.value = ""
    feedback.innerText = ""
}
async function startTheChallenge() {
    const allCoins = await loadCoins();
// Filter coins to only include ones with is_active = true and type = "coin"
coins = allCoins.filter(coin => coin.is_active && coin.type === "coin");
    selectedCoins = [];
    while (selectedCoins.length < 3) {
        const randomCoin = coins[Math.floor(Math.random() * coins.length)];
        if (!selectedCoins.find(c => c.id === randomCoin.id)) {
            selectedCoins.push(randomCoin);
        }
    }
    // Select 3 random coins
    // Fetch details for each coin
    // Store them in selectedCoins
    score = 0;
    currentRound = 0
    resultArea.classList.add("hidden");
    gameArea.classList.remove("hidden");
    nextRound();
}

submitButton.addEventListener("click", () => {
    const userGuess = guessInput.value.trim().toLowerCase();

    if (userGuess === "") {
        feedback.innerText = "Please enter a guess!";
        return;
    }
    const actual = currentCoin.name.toLowerCase();
    if (userGuess === actual) {
        feedback.innerText = "✅ Correct!";
        feedback.className = "correct";
        score++;
    }else {
        feedback.innerText = `❌ Incorrect! the correct answer was ${currentCoin.name}`;
        feedback.className = "incorrect";
    }
    //updates scores and shows the feedback
    //compares guess with the actual coin name
    submitButton.disabled = true;
    currentRound++;
    if (currentRound < 3) {
        setTimeout(() => {
            submitButton.disabled = false;
            nextRound();
        }, 3000);
    }else {
        setTimeout(() => {
            endGame();
            submitButton.disabled = false;
        }, 3000);
    }
});
function endGame() {
    gameArea.classList.add("hidden");
    resultArea.classList.remove("hidden");
    finalScore.innerText = `Your Score ${score} out of 3 correct!`;
    answers.innerHTML = selectedCoins.map(c=> {
        const name = c.details?.name || c.name || "Unknown";
        const symbol = c.details?.symbol || c.symbol || "";
        return `✅ ${name} (${symbol})`;
    }).join("<br>")
    }
//shows the final results
restartButton.addEventListener("click", () => {
    score = 0;
    currentRound = 0;
    selectedCoins = [];
    startTheChallenge();
})
