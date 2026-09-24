
const TT_FACTOR = 28.842; // nmol/L -> ng/dL for testosterone (MW 288.42)
const FT_FACTOR = 3.467;  // pg/mL -> pmol/L
function fmt(n,d=2){return Number.isFinite(n)?new Intl.NumberFormat('de-DE',{maximumFractionDigits:d}).format(n):'–'}

const ttVal=document.getElementById('ttValue');
const ttUnit=document.getElementById('ttUnit');
const ttOut=document.getElementById('ttOutput');
function convertTT(){
  if(!ttVal||!ttUnit||!ttOut)return;
  const v=parseFloat(String(ttVal.value).replace(',','.'));
  if(!Number.isFinite(v)){ttOut.innerHTML='<div class="result-card info"><h4>Wert eingeben</h4><p>Der Umrechner zeigt dir denselben Testosteronwert in nmol/L, ng/dL und ng/mL.</p></div>';return;}
  let ngdl;
  if(ttUnit.value==='nmol'){ngdl=v*TT_FACTOR}else if(ttUnit.value==='ngml'){ngdl=v*100}else{ngdl=v}
  const nmol=ngdl/TT_FACTOR, ngml=ngdl/100;
  ttOut.innerHTML=`<div class="result-card good"><h4>${fmt(nmol)} nmol/L = ${fmt(ngdl,0)} ng/dL = ${fmt(ngml,2)} ng/mL</h4><p>Reine Einheitenumrechnung – keine Bewertung oder Diagnose.</p></div>`;
}
[ttVal,ttUnit].forEach(e=>e&&e.addEventListener('input',convertTT));
convertTT();

const ftVal=document.getElementById('ftValue');
const ftUnit=document.getElementById('ftUnit');
const ftOut=document.getElementById('ftOutput');
function convertFT(){
  if(!ftVal||!ftUnit||!ftOut)return;
  const v=parseFloat(String(ftVal.value).replace(',','.'));
  if(!Number.isFinite(v)){ftOut.innerHTML='<div class="result-card info"><h4>Wert eingeben</h4><p>Für freies Testosteron rechnen wir pg/mL und pmol/L um.</p></div>';return;}
  let pgml=ftUnit.value==='pmol'?v/FT_FACTOR:v;
  let pmol=pgml*FT_FACTOR;
  ftOut.innerHTML=`<div class="result-card good"><h4>${fmt(pgml,2)} pg/mL = ${fmt(pmol,0)} pmol/L</h4><p>Auch hier gilt: Umrechnung ist nicht Interpretation.</p></div>`;
}
[ftVal,ftUnit].forEach(e=>e&&e.addEventListener('input',convertFT));
convertFT();

function val(id){const e=document.getElementById(id); return e?e.value:''}
function checked(id){const e=document.getElementById(id); return !!(e&&e.checked)}
function num(id){const raw=val(id).replace(',','.');const n=parseFloat(raw);return Number.isFinite(n)?n:null}
function addCard(arr,type,title,text){arr.push(`<div class="result-card ${type}"><h4>${title}</h4><p>${text}</p></div>`)}
function analyzeLabs(){
  const out=document.getElementById('labResults'); if(!out)return;
  let cards=[];
  const t=num('labTT'); const unit=val('labTTUnit');
  let nmol=null,ngdl=null;
  if(t!==null){ if(unit==='nmol'){nmol=t;ngdl=t*TT_FACTOR}else if(unit==='ngml'){ngdl=t*100;nmol=ngdl/TT_FACTOR}else{ngdl=t;nmol=ngdl/TT_FACTOR} }
  const symptoms=val('symptoms')==='yes'; const repeated=val('repeated')==='yes';
  const morning=val('morning')==='yes'; const fasting=val('fasting')==='yes';
  const shbg=val('shbgStatus'), ft=val('ftStatus'), lh=val('lhStatus'), fsh=val('fshStatus'), prl=val('prlStatus'), e2=val('e2Status');
  const onTRT=val('onTRT')==='yes'; const fertility=val('fertility')==='yes'; const hct=num('hct');

  if(nmol!==null){
    addCard(cards,'info','Dein eingegebener Gesamt-T-Wert',`${fmt(nmol)} nmol/L (${fmt(ngdl,0)} ng/dL). Das ist nur die umgerechnete Zahl – die diagnostische Bedeutung hängt von Symptomen, Messbedingungen, Wiederholung, SHBG und weiteren Werten ab.`);
    if(nmol<6){addCard(cards,'urgent','Sehr niedriger Wert im Leitlinienkontext','Unter 6 nmol/L spricht die EAU von schwerem Hypogonadismus. Bei gleichzeitig niedrigem oder unangemessen normalem LH ist eine fachärztliche Abklärung der zentralen Achse besonders wichtig. Das Tool stellt keine Diagnose.');}
    else if(nmol<12){addCard(cards,'warn','Unter der EAU-Entscheidungsschwelle','Die EAU 2026 verwendet 12 nmol/L als wichtigen Schwellenwert bei symptomatischen Männern. Ein einzelner Wert reicht trotzdem nicht: korrekt gemessene Wiederholungswerte und das klinische Bild gehören zusammen.');}
    else{addCard(cards,'good','Oberhalb von 12 nmol/L','Der Wert liegt oberhalb der EAU-Schwelle für late-onset Hypogonadismus. Das schließt Beschwerden nicht aus; besonders bei verändertem SHBG kann freies Testosteron zusätzliche Information liefern.');}
  }
  if(nmol!==null && (!morning || !fasting || !repeated)){
    const misses=[]; if(!morning)misses.push('morgendliche Messung'); if(!fasting)misses.push('Nüchternmessung'); if(!repeated)misses.push('zweite Messung');
    addCard(cards,'warn','Messqualität zuerst prüfen',`Für eine belastbare Abklärung fehlen laut deiner Auswahl: ${misses.join(', ')}. Leitlinien empfehlen morgens, nüchtern und bei auffälligem Wert wiederholt zu messen.`);
  } else if(nmol!==null && morning && fasting && repeated){addCard(cards,'good','Messbedingungen wirken solide','Morgenmessung, nüchtern und wiederholt: Damit ist die Präanalytik deutlich belastbarer als bei einem einzelnen Zufallswert.');}

  if(shbg==='high'){addCard(cards,'info','SHBG hoch','Hohes SHBG kann dazu führen, dass Gesamt-Testosteron relativ ordentlich aussieht, während freies Testosteron niedriger ausfällt. Ursachen und freies T gehören dann in den Kontext.');}
  if(shbg==='low'){addCard(cards,'info','SHBG niedrig','Niedriges SHBG – häufig z. B. bei Adipositas oder Insulinresistenz – kann Gesamt-Testosteron niedriger erscheinen lassen. Freies T kann das Bild relativieren.');}
  if(ft==='low'){addCard(cards,'warn','Freies Testosteron niedrig','Ein niedriger freier Wert kann besonders bei verändertem SHBG relevant sein. Entscheidend sind Mess-/Berechnungsmethode und der Gesamtzusammenhang. Direkte Analog-Immunoassays gelten nicht als verlässliche Referenzmethode.');}

  if(nmol!==null && nmol<12){
    if(lh==='high'){addCard(cards,'info','Muster: niedriges T + hohes LH','Dieses Muster passt eher zu einem primären/hodennahen Problem: Die Hypophyse stimuliert stärker, der Hoden antwortet aber nicht ausreichend. Ursachen müssen ärztlich geklärt werden.');}
    if(lh==='low'||lh==='normal'){addCard(cards,'warn','Muster: niedriges T + niedriges/„normales“ LH','Bei niedrigem Testosteron kann ein normales LH unangemessen niedrig sein. Das Muster passt eher zu sekundärem/zentralem oder funktionellem Hypogonadismus und braucht Ursachenklärung.');}
    if(fsh==='high'){addCard(cards,'info','FSH erhöht','Ein erhöhtes FSH kann auf eine relevante Störung der testikulären/reproduktiven Achse hinweisen, besonders wenn Fertilität eine Rolle spielt.');}
  }

  if(prl==='high'){addCard(cards,'urgent','Prolaktin erhöht','Ein deutlich erhöhtes Prolaktin kann Libido und Gonadenachse beeinflussen. Zusammen mit niedrigem Testosteron bzw. sekundärem Muster gehört das ärztlich eingeordnet; bei passenden Symptomen kann weitere Hypophysendiagnostik nötig sein.');}
  if(e2==='high'){addCard(cards,'info','Estradiol über Laborbereich','Estradiol ist beim Mann kein „Feindhormon“. Ein höherer Wert ist nicht automatisch behandlungsbedürftig. Entscheidend sind Symptome, Messmethode, Testosteronexposition und Kontext.');}
  if(e2==='low'){addCard(cards,'warn','Estradiol niedrig','Zu wenig Estradiol kann u. a. Knochen- und Sexualfunktion beeinträchtigen. „So niedrig wie möglich“ ist bei Männern kein sinnvolles Ziel.');}

  if(hct!==null){
    if(onTRT && hct>54){addCard(cards,'urgent','Hämatokrit über 54 % unter TRT','Die EAU empfiehlt bei Hämatokrit >54 % unter Testosterontherapie eine ärztliche Therapieanpassung bzw. Unterbrechung und weitere Beurteilung. Bitte nicht selbst „gegensteuern“.');}
    else if(onTRT && hct>=50){addCard(cards,'warn','Hämatokrit erhöht sich','Unter TRT ist ein steigender Hämatokrit ein wichtiger Monitoringwert. Nähe zur oberen Grenze sollte mit dem behandelnden Arzt verfolgt werden; individuelle Laborreferenzen und Risikofaktoren zählen.');}
    else{addCard(cards,'info','Hämatokrit im Kontext','Hämatokrit ist besonders vor und unter TRT wichtig, weil Testosteron die Erythropoese stimuliert. Der Einzelwert gehört zu Verlauf, Laborreferenz und Risikoprofil.');}
  }

  if(onTRT && fertility){addCard(cards,'urgent','TRT + Kinderwunsch','Exogenes Testosteron unterdrückt LH/FSH und kann die Spermatogenese stark reduzieren. Leitlinien empfehlen Testosterontherapie nicht bei Männern mit aktuellem Kinderwunsch. Fertilitätsplanung gehört vor die Therapieentscheidung.');}
  if(symptoms && nmol!==null && nmol>=12){addCard(cards,'info','Symptome trotz Wert oberhalb der Schwelle','Müdigkeit, Libidoverlust, Brain Fog und Trainingsstagnation haben viele Doppelgänger – Schlafapnoe, Schilddrüse, Anämie, Depression, Medikamente, Stoffwechsel und Energiedefizit gehören je nach Geschichte mitgedacht.');}
  if(!symptoms && nmol!==null && nmol<12){addCard(cards,'info','Niedriger Wert ohne typische Symptome','Leitlinien definieren Hypogonadismus nicht allein über die Zahl. Ohne passende Beschwerden oder Zeichen ist die klinische Bedeutung anders als bei wiederholt niedrigem T plus typischen Symptomen.');}

  if(cards.length===0)addCard(cards,'info','Noch keine Werte','Fülle die Felder aus, die du kennst. Das Tool arbeitet auch mit Teilinformationen und speichert nichts.');
  out.innerHTML=cards.join('');
}
document.querySelectorAll('.lab-input').forEach(e=>e.addEventListener('input',analyzeLabs));
document.querySelectorAll('.lab-input').forEach(e=>e.addEventListener('change',analyzeLabs));
const labBtn=document.getElementById('analyzeBtn'); if(labBtn)labBtn.addEventListener('click',analyzeLabs);
analyzeLabs();
