const scrap = require('./scrap')


function run() {
    scrap()
        .then((r) => {
            console.log("END",r.authors)
        })

}


run()
