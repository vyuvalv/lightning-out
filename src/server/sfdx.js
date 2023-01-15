const { exec } = require('child_process');

const runCommand = (req, res, sfdxCommand) => {
    exec(sfdxCommand, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        const response = JSON.parse(stdout);
        console.log(`stdout status : ${response.status}`);
        res.send({
            data: response
        });
    });
};

// eslint-disable-next-line no-undef
exports.runCommand = runCommand;
