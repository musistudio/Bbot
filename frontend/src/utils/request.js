// 检查网络
export function checkNetwork() {
    return new Promise(resolve => {
        fetch('http://www.httpbin.org/get')
            .then(res => resolve(res.status === 200))
            .catch(() => resolve(false))
    })
}