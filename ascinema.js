var fs = require('fs')
var os = require('os')
var childProcess = require('child_process');

process.stdin.setEncoding('utf8');
process.stdin.setRawMode(true);
//process.stdin.resume();
//'\u0003' cntrl+c
//'\u001a' cntrl+z
//'\u001b' Enter
//"\n".charCodeAt(0);
let fileName = '1.json'
let currentCommand = ''
let resetTimer = 0
let saver = []


if (process.argv.length == 2) {
    recording()
} else if (process.argv.length > 2 && process.argv[2] == 'replay') {
    replay()
}

function replay() {
    let recorded = require('./1.json')

    for (let index = 0; index < recorded.length; index++) {

        (()=>{
            setTimeout(
                () => {
                    process.stdout.write(recorded[index][2])
                },
                parseInt(recorded[index][0]*1000)
            );
        })()

    }
}

function convertStandarTiming() {
    resetTimer = parseInt(saver[0][0])//get first process.hrtime()
    saver.map(s => {
        s[0] = parseInt(s[0]) - resetTimer
    })
}



function recording() {
    process.stdin.on('data', (data) => {

        if (data == '\u000d') {
            process.stdout.write('\n>>>' + currentCommand + '\n')
            values = currentCommand.split(' ')

            childProcess.spawn(values[0], values.splice(1), {})
                .stdout
                .on('data', (data) => {
                    saver.push([process.hrtime()[0], 'o', "" + data])
                    process.stdout.write(data)
                    currentCommand = ''

                });
        }
        if (data == '\u0003') {
            convertStandarTiming()
            fs.writeFileSync(fileName, JSON.stringify(saver))
            process.exit()
        }
        saver.push([process.hrtime()[0], 'i', "" + data])
        currentCommand += data
        process.stdout.write(data)
    });
}