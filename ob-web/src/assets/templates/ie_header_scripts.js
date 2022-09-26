function changelang(lang){
  if (lang === 'ru'){
    document.head.insertAdjacentHTML('beforeend', '<style>.ie-bilanguage::after {content: attr(data-ru);}</style>');
    lang = 'ru'
  } else if(lang === 'en'){
    document.head.insertAdjacentHTML('beforeend', '<style>.ie-bilanguage::after {content: attr(data-en);}</style>');
    lang = 'en'
  } else {
    document.head.insertAdjacentHTML('beforeend', '<style>.ie-bilanguage::after {content: attr(data-kz);}</style>');
    lang = 'kz'
  }
}
function onCLickSelect() {
  var value = document.getElementsByClassName("ie-select")[0];
  var arrow = document.getElementsByClassName("ie-select-arrow")[0];
  var dropdown = document.getElementsByClassName("ie-select-dropdown")[0];

    arrow.classList.toggle("ie-select-arrow-marked");
    dropdown.classList.toggle("ie-select-dropdown-marked");
    value.classList.toggle("ie-select-marked");
}
function onItemSelected(element, lang) {
  var tagList = [];

  var value = document.getElementsByClassName("ie-select-value")[0];
  var dropdown = document.getElementsByClassName("ie-select-dropdown")[0];
  var tags = dropdown.getElementsByTagName("div");
  
  while( tagList.length != tags.length){
      tagList.push(tags[tagList.length])
  };
  tagList.forEach(function(item){
    item.removeAttribute("class");
  }); 
  element.srcElement.classList.toggle("ie-select-dropdown-selected");
  dropdown.classList.remove("ie-select-dropdown-marked");
  value.innerHTML = lang;
  changelang(lang);
}