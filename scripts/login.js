sessionStorage.setItem('isActiveSession', false);

$(document).ready(function () {



});

var angle = 0;
setInterval(function(){
      angle+=3;
     $("#sportKrugImg").rotate(angle);
},50);


$("#login_btn").click(function () {
    funkcijaLogin(document.getElementById("username_input").value, document.getElementById("password_input").value)
});

function funkcijaLogin(inputFirstName, inputLastName) {
    
    
    $.ajax({
        url: "http://services.odata.org/V3/Northwind/Northwind.svc/Employees",
        dataType: "json",
        success: function(employeesData){
            var flag = false;
            var employees = employeesData.value;
            for ( var employee in employees){
            if (inputFirstName == employees[employee].FirstName && inputLastName == employees[employee].LastName)              {
                    sessionStorage.setItem('isActiveSession', "true");
                    flag = true;
                    location.href = "app.html";
                }
            }
                if (!flag) {

                    $("#hello_p").text("Neispravan Username!");
                }
        }
        
    });
}