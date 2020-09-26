

function push(id) {
    // Update Title in Window's Tab
    document.title = id;
    // Finally push state change to the address bar
    let url = null;
    switch (id) {
        case  "DATA":
            url = "./components/data.html"
            break;
        case "SVG" :
            url = "./components/svg.html"
            break;
        case "REFERENCE":
            url = "./components/reference.html"
            break;
        case "HOME":
            url = "./components/home.html"
            break;
        case "HOMEWORK":
            url = "./components/homework2.html"        
        default:
            break;
    }
    fetch(url).then((response) => response.text()).then(
        (html) => {
            $("#content").html(html)
        }
    )
}
window.onload = event => {
    // Add history push() event when boxes are clicked
    fetch("./components/home.html").then((response) => response.text()).then(
        (html) => {
            $("#content").html(html)
        }
    )

    $("#data").on("click", function () {
        push("DATA")
    })
    $("#svg").on("click", function() {
        push("SVG")
    })
    $("#reference").on("click", function() {
        push("REFERENCE")
    })
    $("#home").on("click", function() {
        push("HOME")
    })
    $("#homeworks").on("click", function() {
        push("HOMEWORK")
    })
}