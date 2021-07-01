const _fesCodeReader = async () =>{
    let codeNode = document.querySelector('[data-tag="@fs-sketch.js"]'), text='';
    if(codeNode){
        //if web editor
        text = codeNode.innerHTML;
    }else{
        //obtain the name of the file in script tag
        const scripts = [...document.querySelectorAll('script')].map(file => file.getAttribute('src')).filter(attr => ![null, undefined, '', 'p5.js','p5.min.js','p5.sound.min.js', 'p5.sound.js'].includes(attr));
        //scripts will have all the files which donsen't contains the files in the array: [null, undefined, '', 'p5.js','p5.min.js','p5.sound.min.js', 'p5.sound.js']
        //there can be multiple files but we will check only 1 file because we assume that user will only use 1 file and not multiple
        //this can of course be extended to multiple files

        await fetch(`${scripts[0]}`).then(res => res.text().then(txt => {
            text = txt;
        })).catch(err => console.log(`ERROR: ${err}`));
    }
    //convert the code to array of lines of code
    _codeToLines(text);
}


const _codeToLines = code => {
    let arr = code.split('\n');

    //filter out variable names from all
    let arrVars = arr.map(line => line.trim()).filter(line => line!==''&&
    !line.includes('//')&&
    (line.includes('let')||line.includes('const'))&&
    (!line.includes('=>') && !line.includes('function')));

    //filter out function names from all
    let arrFunc = arr.map(line => line.trim()).filter(line => line!==''&&
    !line.includes('//')&&
    (line.includes('let')||line.includes('const'))&&
    (line.includes('=>')||line.includes('function')));
    
    
    //now pass the relevant array to a regexer function which will list all the variables/functions
    _extractVariables(arrVars);
    _extractFuncVariables(arrFunc);
};


const _extractVariables = arr => {
    console.log('%cFrom _extractVariables', 'color: black; font-weight: bold; font-size: 16px; background: yellow;');
    //we can extract variable names from here and check
    //there are 2 regex and 2 ways of declaring the variables, we can use them both and do our stuff

    //check if the line contains a , => either let a, b=2,d; or let a = [12,321,342]
    let matches = [];
    arr.forEach(ele => {
        if(ele.includes(',')){
            //do the regex 1

            matches.push(...ele.split(",").flatMap((s) => {
                let match;
                if (s.includes("=")) {

                    match = s.match(/(\w+)\s*(?=\=)/i);
                    return match[1];

                } else if (!s.match(/[\[\]\{\}]/)) {

                    return s.match(/(?:(?:let|const|var)\s+)?([\w$]+)/)[1];

                } else return [];
            }));
            
        }else{
            //do the regex 2
           const reg = /(?:(?:let|const)\s+)([\w$]+)/g;
            const found = ele.matchAll(reg);
            for(const match of found){
              matches.push(match[1]);
            }
        }
    });
    console.log(matches);
    //now we have to check if the obtained variables are a part of p5.js or not
    //problem 1 => if we have comma declaration after a normal declaration then the matches array is overritten prevent that
};

const _extractFuncVariables = arr => {
    let matches = [];
    //we can extract function names from here and check
    console.log('%cFrom _extractFuncVariables', 'color: black; font-weight: bold; font-size: 16px; background: yellow;');
    const reg = /(?:(?:let|const)\s+)([\w$]+)/;
    arr.forEach(ele => {
        matches.push(ele.match(reg)[1]);
    });
    console.log(matches);
}

window.addEventListener('load', _fesCodeReader);




