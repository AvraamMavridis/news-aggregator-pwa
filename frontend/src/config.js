export default {
  endPoint: 'https://hn8r2gj6e6.execute-api.eu-west-1.amazonaws.com/dev/list'
}

const flatten(arr) {
  return arr.reduce((prev, curr, sum) => {
    sum = prev.concat(curr);
  }, [])
}