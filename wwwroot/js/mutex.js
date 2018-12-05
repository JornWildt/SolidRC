// Mutex implementation based on https://github.com/DirtyHairy/async-mutex/blob/master/src/Mutex.ts

class Mutex
{
  constructor()
  {
    this._queue = [];
    this._pending = false;
  }


  isLocked()
  {
    return this._pending;
  }


  acquire()
  {
    let ticket = new Promise(accept => this._queue.push(accept));
    
    if (!this._pending)
      this._dispatchNext();

    return ticket;
  }


  runExclusive(callback)
  {
    return this
    .acquire()
    .then(release => 
    {
      let result;

      try 
      {
        result = callback();
      } 
      catch (e) 
      {
        release();
        throw(e);
      }

      return Promise
        .resolve(result)
        .then(
            (x) => (release(), x),
            e => 
            {
              release();
              throw e;
            }
        );
      }
    );
  }


  _dispatchNext()
  {
    if (this._queue.length > 0)
    {
      this._pending = true;
      this._queue.shift()(this._dispatchNext.bind(this));
    }
    else 
    {
      this._pending = false;
    }
  }
}