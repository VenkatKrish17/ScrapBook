//file handlers

//AIzaSyAMhEmmBB-HOAguDVPpr2VujTnCXKZJzrk
//https://iserve-1521884084109.firebaseio.com/

/* file handler */

var getFileBlob = function (url, cb) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.responseType = "blob";
        xhr.addEventListener('load', function() {
            cb(xhr.response);
        });
        xhr.send();
};

var blobToFile = function (blob, name) {
        blob.lastModifiedDate = new Date();
        blob.name = name;
        return blob;
};

var getFileObject = function(filePathOrUrl, cb) {
       getFileBlob(filePathOrUrl, function (blob) {
          cb(blobToFile(blob, filePathOrUrl));
       });
};


/* file handler end*/

function initFirebase(){
  var config = {
apiKey: "AIzaSyDLSdV7t6S3ZOf4-XPkbFpkDCT-DG8aOEI",
databaseURL:"https://iserve-1521884084109.firebaseio.com/",
authDomain:"iserve-1521884084109b.firebaseapp.com",
storageBucket:"gs://iserve-1521884084109.appspot.com"
};
firebase.initializeApp(config);
console.log("firebase initialized")
}

//firebase initialization

$(document).on("ready",function(){
  language="en"
  $("#cardholder").hide()
  initFirebase()
  if(localStorage.mydata==undefined){

    globalData=[]
    updatelocalStore()
      updateList()
  }
  else {
    globalData=JSON.parse(localStorage.mydata)
      updateList()
  }

//adding a topic
$("#languageoption").on("change",function(){
  language=$(this).val()
  $("#languagepage").dialog("close")
})

$("#addtopic").on("click",function(event){
  alert("hello")
  event.preventDefault()
  topicname=$("#topicname").val()
  globalData.push({'topicname':topicname,artifacts:[]})
  updatelocalStore()
  $("#topicname").val("")
  updateList()
})

function updateList(){
  $("#topiclist").empty()
  for (i in globalData){
    var li=$("<li>")
    var a=$("<a>")
    var span=$("<span>")
    a.html(globalData[i].topicname)
    span.html(globalData[i].artifacts.length)
    span.addClass("ui-li-count")

    li.append(a)
    li.append(span)
    li.attr("id",globalData[i].topicname)
    li.on("click",function(){
      id=$(this).attr("id");
      currentTopic=id;
      $.mobile.changePage("#artifactspage")
      $("#contentheader").html(id)
    })
    $("#topiclist").append(li)
  }
$("#topiclist").listview("refresh")
}
//other utility functions
function updatelocalStore(){
  console.log("updating local store")
  localStorage.setItem("mydata",JSON.stringify(globalData))
}


//page events
$("#homepage").on("pagebeforeshow",function(){
  updateList()
})
$("#artifactspage").on("pagebeforeshow",function(){
  $("#cardholder").show()
    $("#cardholder").empty()
  for (i in globalData){
    /*<div mbsc-card>
  <div class="mbsc-card-header">
      <h2 class="mbsc-card-title">Title in the header</h2>
      <h3 class="mbsc-card-subtitle">Subtitle in the header</h3>
  </div>
  <div class="mbsc-card-content">
      <span class="mbsc-bold">This is the content:</span> Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley
      of type and scrambled it to make a type specimen book.
  </div>
  <div class="mbsc-card-footer">This is a footer</div>
</div>*/
if(globalData[i].topicname==currentTopic){
  console.log(i)
  console.log(globalData[i].artifacts)
  for(j in globalData[i].artifacts){
    container=$("<div>")
    container.addClass("ui-corner-all ui-shadow container-card")
    header=$("<div>")
    header.addClass("mbsc-card-header ui-corner-all ui-shadow")
    footer=$("<div>")
    footer.addClass("mbsc-card-footer ui-corner-all ui-shadow")
    content=$("<div>")
    content.addClass("mbsc-card-content ui-corner-all ui-shadow")
    var local_obj=globalData[i].artifacts[j];
    header.html(local_obj.name)
    container.append(header)
    container.append(content)
    content.html(globalData[i].artifacts[j].insight)
    container.append(footer)
    footer.append("file type - "+local_obj.type)
    translate_btn=$("<button data-inline='true'>")
    translate_btn.html("Translate")
    translate_btn.addClass("ui-btn ui-corner-all")
    translate_btn.css("float","right")
    translate_btn.css("margin-top","-13px")
    translate_btn.css("width","30%")
    translate_btn.button()
    translate_btn.click(function(){
      btn=$(this)
      ftr_content=$($(this).closest("div")).text()
      console.log(ftr_content)
      content_elem=$($($("button")[0].closest("div")).prev()[0]).find("td").last()
      text=content_elem.text()
      console.log("translating "+text)
      if(btn.text()=="Translate"){
        $.ajax({
          type:'POST',
          contentType: 'application/json;charset=UTF-8',
          url:'http://172.29.16.76:5000/translate',
          data:JSON.stringify({'data':text,'from':'en','to':language}),
          success:function(response){
            content_elem.html(response.data)
            btn.html("Undo Translate")
          }
        })
      }
      else{
        //reverse
        text=content_elem.text()
        $.ajax({
          type:'POST',
          contentType: 'application/json;charset=UTF-8',
          url:'http://172.29.16.76:5000/translate',
          data:JSON.stringify({'data':text,'to':'en','from':language}),
          success:function(response){
            content_elem.html(response.data)
            btn.html("Translate")
          }
        })
      }
    })
    footer.append(translate_btn)
    if(local_obj.type.indexOf("text")>=0){
      var table=$("<table border=1>")
      var tr=$("<tr>")
      var td_h=$("<td>Keywords</td>")
      var td=$("<td>")
      insight=local_obj.insight
      td.append(insight.keywords.split("\n").join(", "))
      tr.append(td_h)
      tr.append(td)
      var tr2=$("<tr>")
      var td2=$("<td>")
      var td2_h=$("<td>Summary</td>")
      td2.append(insight.summary)
      tr2.append(td2_h)
      tr2.append(td2)
      table.append(tr)

      table.append(tr2)
      content.append(table)
    }
    else if(local_obj.type.indexOf("image")>=0){
      var table=$("<table>")
      var tr=$("<tr>")
      var td=$("<td>")
      var td2=$("<td>")
      img=$("<img width=120 height=120 style='margin:10px;'>")
      img.attr("src",local_obj.url)
      td.append(img)
      td2.append(local_obj.insight.data)
      tr.append(td)
      tr.append(td2)
      table.append(tr)
      content.append(table)

    }
    else if(local_obj.type.indexOf("audio")>=0){
      var table=$("<table>")
      var tr=$("<tr>")
      var tr2=$("<tr>")
      var td=$("<td align=center>")
      var td2=$("<td>")

      audio=$("<audio controls>")
      source=$("<source>")
      source.attr("src",local_obj.url)
      source.attr("type",local_obj.type)
      audio.append(source)
      td.append(audio)
      td2.append(local_obj.insight.data)
      tr.append(td)
      tr2.append(td2)
      table.append(tr)
      table.append(tr2)
      content.append(table)

    }
    else{
      content.html("NA")
    }
    console.log(container)
    $("#cardholder").append(container)
  }

}

  }

$("#uploadform").on("submit",function(event){
  event.preventDefault();
  file=document.querySelector('#fileref').files[0]
  const name=file.name
  const type=file.type
  const metadata = { contentType: file.type };
  var storageRef = firebase.storage().ref();
  const task=storageRef.child(name).put(file, metadata);
  task
  .then(snapshot => snapshot.ref.getDownloadURL())
  .then(url => {console.log(url)
    obj={'name':name,'type':type,'url':url}
    if(globalData[i].topicname==currentTopic){
      getInsight(obj)

    }

  })
})
})

$("#home").on("pagebeforehide",function(){
  $("#addtopic").off()
})
$("#addartifactpage").on("pagebeforehide",function(){
  $("#uploadform").off()
})

$("#addartifactpage").on("pagebeforehide",function(){
  $("#uploadform").off()

})

$("#languagepage").on("pagebeforehide",function(){
  language=$("#languageoption").val()
  console.log(language)
})


function getInsight(obj){
  obj.lang=language;
  console.log("fetching insight for "+obj.name)
$.ajax({
  type:"POST",
  contentType: 'application/json;charset=UTF-8',
  url:'http://172.29.16.76:5000/getinsight',
  data:JSON.stringify(obj),
  success:function(response){
    console.log(response)
    obj.insight=response;
    globalData[i].artifacts.push(obj)
    updatelocalStore()
      $("#addartifactpage").dialog("close")
  },
  failure:function(error){
    console.log(error)
  }
})

}

})
