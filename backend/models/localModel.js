const fs = require('fs');
const path = require('path');

let DATA_DIR = path.join(__dirname, '../data');

try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (e) {
  DATA_DIR = '/tmp';
}

const memoryStore = {};

class LocalModel {
  constructor(filename) {
    this.filename = filename;
    this.filePath = path.join(DATA_DIR, filename);
    this.initStore();
  }

  initStore() {
    if (memoryStore[this.filename] === undefined || memoryStore[this.filename] === null) {
      try {
        if (fs.existsSync(this.filePath)) {
          const content = fs.readFileSync(this.filePath, 'utf-8');
          memoryStore[this.filename] = JSON.parse(content);
        } else {
          memoryStore[this.filename] = [];
        }
      } catch (e) {
        memoryStore[this.filename] = [];
      }
    }
  }

  read() {
    this.initStore();
    return memoryStore[this.filename] || [];
  }

  write(data) {
    memoryStore[this.filename] = data;
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
    } catch (err) {
      // In read-only serverless filesystems (e.g. Vercel), safely rely on in-memory store
    }
  }
  
    async find(query = {}) {
      const data = this.read();
      return data.filter(item => {
        for (let key in query) {
          // Soft checking (e.g. check string vs array/objects or simple string check)
          if (item[key] !== query[key]) return false;
        }
        return true;
      });
    }
  
    async findOne(query = {}) {
      const data = this.read();
      return data.find(item => {
        for (let key in query) {
          if (item[key] !== query[key]) return false;
        }
        return true;
      }) || null;
    }
  
    async findById(id) {
      const data = this.read();
      return data.find(item => item._id === id || String(item._id) === String(id)) || null;
    }
  
    async create(doc) {
      const data = this.read();
      const newDoc = {
        _id: Math.random().toString(36).substring(2, 11),
        createdAt: new Date().toISOString(),
        ...doc
      };
      data.push(newDoc);
      this.write(data);
      return newDoc;
    }
  
    async findByIdAndUpdate(id, update, options = {}) {
      const data = this.read();
      const index = data.findIndex(item => item._id === id || String(item._id) === String(id));
      if (index === -1) return null;
      data[index] = { ...data[index], ...update, updatedAt: new Date().toISOString() };
      this.write(data);
      return data[index];
    }
  
    async findByIdAndDelete(id) {
      const data = this.read();
      const index = data.findIndex(item => item._id === id || String(item._id) === String(id));
      if (index === -1) return null;
      const removed = data.splice(index, 1);
      this.write(data);
      return removed[0];
    }
  
    async deleteOne(query = {}) {
      const data = this.read();
      const index = data.findIndex(item => {
        for (let key in query) {
          if (item[key] !== query[key]) return false;
        }
        return true;
      });
      if (index === -1) return null;
      const removed = data.splice(index, 1);
      this.write(data);
      return removed[0];
    }
  
    async countDocuments(query = {}) {
      const results = await this.find(query);
      return results.length;
    }
  }
  
  module.exports = LocalModel;
