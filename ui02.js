/* HO SO GIA DINH — UI02 V05: presentation-only adapter.
 * Keeps app.js, sync.js, vault, records and event routing untouched.
 * Do not persist data, change app state, call APIs or manipulate OAuth.
 */
(function(){
  'use strict';
  const baseRenderHome=window.renderHome;
  if(typeof baseRenderHome!=='function'){
    console.warn('[HSGD UI02] Chưa có renderHome; giao diện gốc được giữ nguyên.');
    return;
  }
  const upper=s=>String(s||'').toLocaleUpperCase('vi-VN');
  function sectionByTitle(root,title){
    return Array.from(root.querySelectorAll('.section-head h3'))
      .find(h=>h.textContent.trim()===title)?.parentElement||null;
  }
  window.renderHome=function renderHomeUI02(){
    const html=baseRenderHome.apply(this,arguments);
    try{
      const root=document.createElement('div');
      root.innerHTML=html;
      const stats=root.querySelector('.four-stats');
      const cats=root.querySelector('.category-grid');
      if(!stats||!cats||stats.children.length!==4||cats.children.length!==4){
        console.warn('[HSGD UI02] Khác cấu trúc trang Tổng quan, giữ giao diện gốc.');
        return html;
      }
      // Move the introductory sentence to the fixed top bar; hide the big hero block.
      root.querySelector(':scope > .section-kicker')?.remove();
      root.querySelector(':scope > .big-heading')?.remove();
      root.querySelector(':scope > .subtext')?.remove();
      root.querySelector(':scope > .hero-card')?.remove();

      const tools=document.createElement('div');
      tools.className='ui02-overview-tools';
      const heading=document.createElement('h2');
      heading.className='ui02-overview-caption';
      heading.textContent='THỐNG KÊ HỒ SƠ';
      heading.style.margin='0';
      const add=document.createElement('button');
      add.type='button';
      add.className='primary-btn ui02-add-record';
      add.dataset.action='new-record'; // Existing app.js handler; no business change.
      add.textContent='＋ Thêm hồ sơ';
      tools.append(heading,add);
      stats.before(tools);
      stats.classList.add('ui02-stats');
      for(const card of stats.children){
        const icon=card.querySelector('.stat-ico');
        const label=card.querySelector('.stat-label');
        const value=card.querySelector('.stat-num');
        if(!icon||!label||!value)throw new Error('Thiếu ô thống kê');
        label.textContent=upper(label.textContent).replace(/:$/,'')+':';
        value.removeAttribute('style');
        card.replaceChildren(icon,label,value);
      }
      cats.classList.add('ui02-categories');
      for(const cat of cats.children){
        const icon=cat.querySelector('.cat-icon');
        const oldName=cat.querySelector('strong');
        const oldInfo=cat.querySelector('small');
        if(!icon||!oldName||!oldInfo)throw new Error('Thiếu ô danh mục');
        const name=upper(oldName.textContent);
        const numMatch=oldInfo.textContent.trim().match(/^([\d.,\s]+)\s+hồ sơ/i);
        if(!numMatch)throw new Error('Không xác định được số hồ sơ danh mục');
        const label=document.createElement('span');
        label.className='ui02-cat-label';
        label.textContent=name+':';
        const count=document.createElement('strong');
        count.className='ui02-cat-count';
        count.textContent=numMatch[1].trim();
        cat.setAttribute('aria-label',label.textContent+' '+count.textContent);
        cat.replaceChildren(icon,label,count);
      }
      // An empty notice takes only the space its content needs.
      const alertHead=sectionByTitle(root,'Giấy tờ cần theo dõi');
      const alerts=alertHead?.nextElementSibling;
      if(alerts?.classList.contains('empty')){
        const text=alerts.querySelector('strong')?.textContent||'Chưa có hồ sơ sắp hết hạn';
        const desc=alerts.querySelector('p')?.textContent||'';
        const mark=document.createElement('span');mark.className='ui02-watch-icon';mark.textContent='✓';mark.setAttribute('aria-hidden','true');
        const copy=document.createElement('div');copy.className='ui02-watch-copy';
        const title=document.createElement('strong');title.textContent=text;
        const small=document.createElement('p');small.textContent=desc;
        copy.append(title,small);
        alerts.classList.add('ui02-watch-empty');
        alerts.replaceChildren(mark,copy);
      }else if(alerts?.classList.contains('alert-list')){
        alerts.classList.add('ui02-watch-list');
      }
      // V05: the recent section has no blank panel when there are no records.
      // Read-only view: use the unchanged itemRecord renderer for each existing record.
      const recentHead=sectionByTitle(root,'Hồ sơ cập nhật gần đây');
      const recent=recentHead?.nextElementSibling;
      const recentRecords=Array.isArray(state?.records)
        ? [...state.records].sort((a,b)=>String(b.updatedAt||'').localeCompare(String(a.updatedAt||'')))
        : [];
      if(recentHead && recent){
        if(recentRecords.length===0){
          recent.remove();
          recentHead.remove();
        } else if(typeof itemRecord==='function'){
          const entries=recentRecords.map((record,index)=>{
            const holder=document.createElement('div');
            holder.innerHTML=itemRecord(record); // same escaped markup and data-record as app.js
            const card=holder.firstElementChild;
            if(!card||!card.matches('[data-record]'))throw new Error('Thiếu thẻ hồ sơ cập nhật');
            const title=card.querySelector('.card-title');
            if(!title)throw new Error('Thiếu tên hồ sơ cập nhật');
            const originalName=title.textContent.trim();
            const match=originalName.match(/^(.*?)\s+(\d{1,4})$/u);
            const name=document.createElement('span');
            name.className='ui02-recent-title';
            name.textContent=match?match[1]:originalName;
            const number=document.createElement('strong');
            number.className='ui02-recent-number';
            number.textContent=match?match[2]:String(index+1).padStart(2,'0');
            number.setAttribute('aria-label',match?'Số cuối tên hồ sơ: '+match[2]:'Thứ tự cập nhật: '+(index+1));
            title.classList.add('ui02-recent-name');
            title.replaceChildren(name,number);
            card.title=originalName;
            return card;
          });
          recent.className='list ui02-recent';
          recent.replaceChildren(...entries);
          recent.setAttribute('aria-label','Các hồ sơ cập nhật gần đây, cuộn để xem thêm');
          recent.setAttribute('role','region');
          recent.setAttribute('tabindex','0');
        }
      }
      return root.innerHTML;
    }catch(e){
      console.warn('[HSGD UI02] Lỗi hiển thị, giữ giao diện V3.3.0:',e);
      return html; // Safe fallback, never affect encrypted vault/data.
    }
  };
})();
