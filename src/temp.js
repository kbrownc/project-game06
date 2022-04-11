function MakeQuerablePromise(promise) {
    if (promise.isFulfilled) return promise;

    let isPending = true;
    let isRejected = false;
    let isFulfilled = false;
    let result = promise.then(
        function(v) {
            isFulfilled = true;
            isPending = false;
            return v; 
        }, 
        function(e) {
            isRejected = true;
            isPending = false;
            throw e; 
        }
    );
    result.isFulfilled = function() { return isFulfilled; };
    result.isPending = function() { return isPending; };
    result.isRejected = function() { return isRejected; };
    return result;
}
let originalPromise = new Promise(function(resolve,reject){
    setTimeout(function(){
        resolve("Yeah !");
    },10000);
});
let myPromise = MakeQuerablePromise(fetchPromise);

console.log("Initial fulfilled:", myPromise.isFulfilled());//false
console.log("Initial rejected:", myPromise.isRejected());//false
console.log("Initial pending:", myPromise.isPending());//true

myPromise.then(function(data){
    console.log(data); // "Yeah !"
    console.log("Final fulfilled:", myPromise.isFulfilled());//true
    console.log("Final rejected:", myPromise.isRejected());//false
    console.log("Final pending:", myPromise.isPending());//false
});