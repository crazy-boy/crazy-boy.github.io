(() => {
  function update() {
    const now = new Date(), year = now.getFullYear() + 1;
    const left = Math.max(0, Math.floor((new Date(year,0,1) - now) / 1000));
    document.getElementById('countdown-year').textContent = year + '年';
    for (const [id,value,unit] of [['t_d',Math.floor(left/86400),'天'],['t_h',Math.floor(left/3600)%24,'时'],['t_m',Math.floor(left/60)%60,'分'],['t_s',left%60,'秒']]) document.getElementById(id).textContent = value + unit;
    const seconds = now.getSeconds(), minutes = now.getMinutes() + seconds / 60, hours = now.getHours() % 12 + minutes / 60;
    document.querySelector('.hr').style.transform = `rotateZ(${hours*30}deg)`;
    document.querySelector('.mn').style.transform = `rotateZ(${minutes*6}deg)`;
    document.querySelector('.sc').style.transform = `rotateZ(${seconds*6}deg)`;
  }
  update();
  setInterval(update,1000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)update();});
})();
