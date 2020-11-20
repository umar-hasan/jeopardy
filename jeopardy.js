// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

let categories = [];

const NUM_CATEGORIES = 6
const NUM_QUESTIONS_PER_CAT = 5

/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

function getCategoryIds() {
    let cats = []
    for (var i = 0; i < NUM_CATEGORIES; i++) {
        cats[i] = Math.floor(Math.random() * 1000)
    }
    return cats
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

function getCategory(catId) {
    return axios.get("http://jservice.io/api/category", {params: {id: catId}})
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable() {

    if ($("#jeopardy").length) {
        $("#jeopardy").remove()
    }

    const table = document.createElement("table")
    table.id = "jeopardy"
    const header = document.createElement("thead")
    const header_row = document.createElement("tr")
    for (let category of categories) {
        let cell = document.createElement("td")
        cell.innerText = category.title
        header_row.appendChild(cell)
    }
    header.append(header_row)
    table.append(header)

    const body = document.createElement("tbody")
    for (let i = 0; i < 5; i++) {
        let row = document.createElement("tr")
        for (let j = 0; j < NUM_CATEGORIES; j++) {
            let cell = document.createElement("td")
            cell.innerText = "?"
            cell.className = `clue-${j}-${i} qa-cell`
            row.appendChild(cell)
        }
        body.appendChild(row)
    }
    
    table.append(body)

    $('#game').append(table)

}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(evt) {

    console.log(evt.target.className)
    if (!$(evt.target).hasClass("question") && !$(evt.target).hasClass("answer")) {
        let cat = parseInt(evt.target.className[5])
        let clue = parseInt(evt.target.className[7])
        evt.target.className += " question"
        evt.target.innerText = categories[cat].clues[clue].question
    }
    else if ($(evt.target).hasClass("question") && !$(evt.target).hasClass("answer")) {
        let cat = parseInt(evt.target.className[5])
        let clue = parseInt(evt.target.className[7])
        evt.target.classList.remove("question")
        evt.target.className += " answer"
        evt.target.innerText = categories[cat].clues[clue].answer
    }
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {
    $("#start").attr('disabled', 'true')
    $("#start").text("Loading...")
    $("#start").append('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>')
}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
    $("#start").remove('.spinner-border')
    $("#start").removeAttr('disabled')
    $("#start").text("Restart")
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
    const cats = getCategoryIds()
    for (let i = 0; i < NUM_CATEGORIES; i++) {
        const res = await getCategory(cats[i])
        categories[i] = {title: res.data.title, clues: res.data.clues}
        if (categories[i].clues.length > 5) {
            let clues = categories[i].clues.slice(0, 5).map(function() {
                return this.splice(Math.floor(Math.random() * categories[i].length), 1)[0]
            }, categories[i].clues.slice())
            categories[i].clues = clues
        }
        console.log(categories[i].clues)
    }
    
    fillTable()
    console.log(categories)
}

/** On click of start / restart button, set up game. */
$("#start").on("click", async function() {
    showLoadingView()
    await setupAndStart()
    hideLoadingView()
})

/** On page load, add event handler for clicking clues */

$("#game").on("click", ".qa-cell", handleClick)
