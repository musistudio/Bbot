class DB {
    constructor(db_name, version) {
      let request = window.indexedDB.open(db_name, version);
      this.db = null;
      request.onsuccess = (event) => {
        this.db = request.result;
        console.log('数据库打开成功');
      };
      request.onerror = (event) => {
        console.log('数据库打开报错');
      };
      request.onupgradeneeded = (event) => {
        this.db = event.target.result;
        var objectStore;
        if (!this.db.objectStoreNames.contains('crontab')) {
          objectStore = this.db.createObjectStore('crontab', {
            keyPath: 'id',
            autoIncrement: true,
          });
        }
      };
    }

    async add(table, data) {
      return new Promise((resolve, reject) => {
        var request = this.db
          .transaction([table], 'readwrite')
          .objectStore(table)
          .add(data);
        request.onsuccess = function (event) {
          resolve(event);
        };
        request.onerror = function (event) {
          reject(event);
        };
      });
    }

    async read(table, id) {
      return new Promise((resolve, reject) => {
        var transaction = this.db.transaction([table]);
        var objectStore = transaction.objectStore(table);
        var request = objectStore.get(id);
        request.onerror = function (event) {
          reject(event);
        };
        request.onsuccess = function (event) {
          resolve(request.result);
        };
      });
    }

    async readAll(table) {
      return new Promise((resolve, reject) => {
        var objectStore = this.db.transaction(table).objectStore(table);
        let datas = [];
        objectStore.openCursor().onsuccess = function (event) {
          var cursor = event.target.result;
          if (cursor) {
            datas.push(cursor.value);
            cursor.continue();
          } else {
            resolve(datas);
          }
        };
        objectStore.openCursor().onerror = function (event) {
          reject(event);
        };
      });
    }

    async put(table, data) {
      return new Promise((resolve, reject) => {
        var request = this.db
          .transaction([table], 'readwrite')
          .objectStore(table)
          .put(data);
        request.onsuccess = function (event) {
          resolve(event);
        };
        request.onerror = function (event) {
          reject(event);
        };
      });
    }
  }