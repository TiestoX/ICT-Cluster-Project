  if (sessionStorage.getItem('isActiveSession') == "false" || !sessionStorage.getItem('isActiveSession')) {
      location.href = "index.html";
      sessionStorage.setItem('isActiveSession', false);
  }

  var total = 0;
  var countQuantity = 0;
  var arrBucket = [];
  var categories = [];
  var products = [];
  var arrBucketFlag = false;
  var advancedSearch = false;

  $(document).ready(function () {
      $.ajax({
          url: "http://services.odata.org/V3/Northwind/Northwind.svc/Products",
          dataType: "json",
          success: function (productValue) {
              products = productValue.value;
              $.ajax({
                  url: "http://services.odata.org/V3/Northwind/Northwind.svc/Categories",
                  dataType: "json",
                  success: function (categoryValue) {
                      categories = categoryValue.value;
                      fillCategoryComboBox();
                      getProductData();
                  }
              });
          }
      });
  });


  $("#signOut").click(function () {
      signOut();
  });

  $("#btnSearch").click(function () {
      var nowDate = new Date();
      $("#dateSearch1").val(getTodayDate());
      $("#dateSearch2").val(getTodayDate());

      if (advancedSearch == true) {
          advancedSearch = false;
          $("#btnSearch").css("background-color", "#4cae4c");
          $("#btnSearch").text("Advanced");
      } else {
          advancedSearch = true;
          $("#btnSearch").css("background-color", "#d9534f");
          $("#btnSearch").text("Disable");
      }
  });





  $("#selectCriteria").change(function () {

      var selectedCriteriaValue = document.getElementById("selectCriteria").value;

      if (selectedCriteriaValue == 1 || selectedCriteriaValue == 2) {
          $("#dateSearch2").hide();       
      } else {
          $("#dateSearch2").show();
    }
      searchProductByCriteria();

  });

  $("#btnSearch").click(function () {
      $("#searchByDate").fadeToggle();
  });

  function signOut() {
      sessionStorage.setItem('isActiveSession', false);
      location.href = "index.html";
  }

  $(function () {
      $("#datepicker").datepicker();
      $("#dateSearch1").datepicker();
      $("#dateSearch2").datepicker();
  });

  //ADD TO BUCKET
  function functionAdd(button) {

      var priceID = "price" + button.id;
      var quantityID = "quantity" + button.id;

      var priceValue = new Number($("#" + priceID).text());
      var quantityValue = new Number($("#" + quantityID).val());

      if (quantityValue < 1) {
          $("#quantityID").value("1");
          return;
      }


      for (var product in products) {

          if (products[product].ProductID == (button.id).slice(4)) {

              if (testIfProductExistsInArrayArrBucket(products[product].ProductID) == true) {

                  findQuantityOfProductInArrBucketAdd(products[product].ProductID, parseInt(quantityValue));

              } else {
                  var product1 = getProductByProductId(products[product].ProductID);
                  product1.Quantity = parseInt(quantityValue);
                  arrBucket.push(product1);
              }
          }
      }
      if (arrBucketFlag == true) {
          showBucket();
      }

      $("#count-bucket").text(countQuantity += quantityValue);

      total = total + priceValue * quantityValue;
      $("#total-price-span").text(total);
      $("#" + quantityID).val(1);
  }

  //PROVERAVA DA LI PRODUCT POSTOJI U KORPI
  function testIfProductExistsInArrayArrBucket(ProductID) {
      for (var product in arrBucket) {

          if (arrBucket[product].ProductID == ProductID) {
              return true;
          }

      }
  }

  //TRAZI PRODUCT U KORPI NA OSNOVU ID-A I DODAJE ZELJENU KOLICINU
  function findQuantityOfProductInArrBucketAdd(ProductID, addQuanity) {
      for (var product in arrBucket) {

          if (arrBucket[product].ProductID == ProductID) {

              arrBucket[product].Quantity += addQuanity;
          }
      }

  }

  //SUBSTRACT FROM BUCKET
  function functionSub(button) {

      var priceID = "price" + button.id;
      var quantityID = "quantity" + button.id;
      var titleID = "title" + button.id;
      var priceValue = new Number($("#" + priceID).text());
      var titleValue = new String($("#" + titleID).text());
      var quantityValue = new Number($("#" + quantityID).val());

      if (quantityValue < 1) {
          $("#" + quantityID).val(1);
          return;
      }


      for (var product in arrBucket) {

          if (arrBucket[product].ProductID == (button.id).slice(4)) {

              if (parseInt(quantityValue) > arrBucket[product].Quantity) {
                  alert("Nemate dovoljno proizvoda da oduzmete!");

                  if (arrBucketFlag == true) {
                      showBucket();
                  }

                  break;
              }

              if (parseInt(quantityValue) == arrBucket[product].Quantity) {

                  if (arrBucket[product].Quantity - parseInt(quantityValue) == 0) {
                      $("#count-bucket").text(countQuantity -= quantityValue);
                      total = total - priceValue * quantityValue;
                      arrBucket.splice(product, 1);
                      $("#total-price-span").text(total);

                      if (arrBucketFlag == true) {
                          showBucket();
                      }
                      break;
                  }
              }

              if (parseInt(quantityValue) < arrBucket[product].Quantity) {
                  $("#count-bucket").text(countQuantity -= quantityValue);
                  total = total - priceValue * quantityValue;
                  arrBucket[product].Quantity -= parseInt(quantityValue);
                  $("#total-price-span").text(total);

                  if (arrBucketFlag == true) {
                      showBucket();
                  }
                  break;
              }
          }

      }
      $("#" + quantityID).val(1);

  }

  function clearAllProducts() {
      $("#item-list-row").empty();
  }

  //TRAZI PRODUCT U KORPI NA OSNOVU ID-A I VRACA KOLICINU
  function findQuantityOfProductInArrBucket(ProductID) {
      for (var product in arrBucket) {

          if (arrBucket[product].ProductID == ProductID) {

              return arrBucket[product].Quantity;
          }
      }

  }


  $("#bucket").click(function () {
      showBucket();
      arrBucketFlag = true;
  });


  //TRAZI CATEGORY ID PO PRODUCT ID
  function getCategoryIdByProductId(ProductID) {
      for (var product in products) {

          if (products[product].ProductID == ProductID) {

              return products[product].CategoryID;
          }
      }

  }

  //TRAZI PRODUCT PO PRODUCT ID
  function getProductByProductId(ProductID) {
      for (var product in products) {
          if (products[product].ProductID == ProductID) {
              return products[product];
          }
      }

  }

  function showBucket() {
      clearAllProducts();
      for (var product in arrBucket) {
          var product1 = getProductByProductId(arrBucket[product].ProductID)
          newProduct(product1);
          var productHTML = new String("titleItem" + product1.ProductID);
          $("#" + productHTML).notify(product1.Quantity, {
              hideDuration: 9999999999,
              elementPosition: 'bottom right'
          });
      }
  }

  //ADD NEW PRODUCT BUTTON
  $("#addProductBtn").click(function () {
      productForm();
  });

  //OPEN NEW PRODUCT FORM AND DISABLE BACKGROUND
  function productForm() {
      $("#addProductForm").fadeIn();
      $("#disable-div").fadeIn();
      $("#item-list").attr("pointer-events", "none", "!important");
      document.body.style.setProperty("overflow", "hidden");
  }

  //EXIT PRODUCT
  function exitProduct() {
      $("#productImgInput").val("");
      $("#productTitleInput").val("");
      $("#productPriceInput").val("");
      $("#productCategorySelect").val("1");
      $("#datepicker").val("");

      $("#addProductForm").fadeOut();
      $("#disable-div").fadeOut();
      $("#item-list").attr("pointer-events", "all", "important");
      document.body.style.setProperty("overflow", "visible");
  }


  //SEARCH

  $("#searchCategorySelect").change(function () {
      searchProductByCriteria();
  });

  $("#criteriaInput").keyup(function () {
      searchProductByCriteria();
  });

  $("#dateSearch1").change(function () {
      searchProductByCriteria();
  });

  $("#dateSearch2").change(function () {
      searchProductByCriteria();
  });


  function searchProductByCriteria() {

      var searchCategorySelect = $("#searchCategorySelect").val();
      var criteriaInput = $("#criteriaInput").val();
      var selectCriteria = $("#selectCriteria").val();
      var dateSearch1 = Date.parse($("#dateSearch1").val());
      var dateSearch2 = Date.parse($("#dateSearch2").val());

      if (arrBucketFlag == true) {
          var arrProductsData = arrBucket;

      } else {

          var arrProductsData = products;
      }

      for (var product in arrProductsData) {

          var productShowHide = "product" + arrProductsData[product].ProductID;
          var categoryName = getProductCategoriesByCategoryID(arrProductsData[product].CategoryID);
          var CreationDateValue = Date.parse(arrProductsData[product].CreationDate);

          if (advancedSearch == false) {

              if (criteriaInput == "" && searchCategorySelect != "") {
                  if (arrProductsData[product].CategoryID != searchCategorySelect) {
                      $("#" + productShowHide).hide();
                  } else if (arrProductsData[product].CategoryID == searchCategorySelect) {
                      $("#" + productShowHide).show();
                  }
              }


              if (criteriaInput != "" && searchCategorySelect == "") {
                  if (searchProductName(arrProductsData[product].ProductName, criteriaInput, categoryName) == false) {
                      $("#" + productShowHide).hide();

                  } else if (searchProductName(arrProductsData[product].ProductName, criteriaInput, categoryName) == true) {
                      $("#" + productShowHide).show();
                  }
              }


              if (criteriaInput == "" && searchCategorySelect == "") {
                  $("#" + productShowHide).show();
              }


              if (criteriaInput != "" && searchCategorySelect != "") {
                  if (arrProductsData[product].CategoryID == searchCategorySelect && searchProductName(arrProductsData[product].ProductName, criteriaInput, categoryName) == true) {
                      $("#" + productShowHide).show();
                  } else {
                      $("#" + productShowHide).hide();
                  }
              }




          } else {
              if (selectCriteria == 1 && dateSearch1 <= CreationDateValue) {
                  if (criteriaInput == "" && searchCategorySelect != "") {
                      if (arrProductsData[product].CategoryID != searchCategorySelect) {
                          $("#" + productShowHide).hide();
                      } else if (arrProductsData[product].CategoryID == searchCategorySelect) {
                          $("#" + productShowHide).show();
                      }
                  }

                  if (criteriaInput != "" && searchCategorySelect == "") {
                      if (searchProductName(arrProductsData[product].ProductName, criteriaInput) == false) {
                          $("#" + productShowHide).hide();

                      } else if (searchProductName(arrProductsData[product].ProductName, criteriaInput) == true) {
                          $("#" + productShowHide).show();
                      }
                  }


                  if (criteriaInput == "" && searchCategorySelect == "") {
                      $("#" + productShowHide).show();
                  }


                  if (criteriaInput != "" && searchCategorySelect != "") {
                      if (arrProductsData[product].CategoryID == searchCategorySelect && searchProductName(arrProductsData[product].ProductName, criteriaInput) == true) {
                          $("#" + productShowHide).show();
                      } else {
                          $("#" + productShowHide).hide();
                      }
                  }

              } else  {
                  $("#" + productShowHide).hide();
              }

              if (selectCriteria == 2 && dateSearch1 >= CreationDateValue) {
                  if (criteriaInput == "" && searchCategorySelect != "") {
                      if (arrProductsData[product].CategoryID != searchCategorySelect) {
                          $("#" + productShowHide).hide();
                      } else if (arrProductsData[product].CategoryID == searchCategorySelect) {
                          $("#" + productShowHide).show();
                      }
                  }

                  if (criteriaInput != "" && searchCategorySelect == "") {
                      if (searchProductName(arrProductsData[product].ProductName, criteriaInput) == false) {
                          $("#" + productShowHide).hide();

                      } else if (searchProductName(arrProductsData[product].ProductName, criteriaInput) == true) {
                          $("#" + productShowHide).show();
                      }
                  }


                  if (criteriaInput == "" && searchCategorySelect == "") {
                      $("#" + productShowHide).show();
                  }


                  if (criteriaInput != "" && searchCategorySelect != "") {
                      if (arrProductsData[product].CategoryID == searchCategorySelect && searchProductName(arrProductsData[product].ProductName, criteriaInput) == true) {
                          $("#" + productShowHide).show();
                      } else {
                          $("#" + productShowHide).hide();
                      }
                  }

              } else if (selectCriteria == 2 && dateSearch1 < CreationDateValue) {
                  $("#" + productShowHide).hide();
              }

              if (selectCriteria == 3 && dateSearch1 <= CreationDateValue && dateSearch2 >= CreationDateValue) {
                  if (criteriaInput == "" && searchCategorySelect != "") {
                      if (arrProductsData[product].CategoryID != searchCategorySelect) {
                          $("#" + productShowHide).hide();
                      } else if (arrProductsData[product].CategoryID == searchCategorySelect) {
                          $("#" + productShowHide).show();
                      }
                  }


                  if (criteriaInput != "" && searchCategorySelect == "") {
                      if (searchProductName(arrProductsData[product].ProductName, criteriaInput) == false) {
                          $("#" + productShowHide).hide();

                      } else if (searchProductName(arrProductsData[product].ProductName, criteriaInput) == true) {
                          $("#" + productShowHide).show();
                      }
                  }


                  if (criteriaInput == "" && searchCategorySelect == "") {
                      $("#" + productShowHide).show();
                  }


                  if (criteriaInput != "" && searchCategorySelect != "") {
                      if (arrProductsData[product].CategoryID == searchCategorySelect && searchProductName(arrProductsData[product].ProductName, criteriaInput) == true) {
                          $("#" + productShowHide).show();
                      } else {
                          $("#" + productShowHide).hide();
                      }
                  }

              } else if (selectCriteria == 3 && dateSearch1 > CreationDateValue && dateSearch2 < CreationDateValue) {
                  $("#" + productShowHide).hide();

              }

          }


      }
  }

  $("#allProducts").click(function () {
      arrBucketFlag = false;
      clearAllProducts();
      getProductData();
      $("#searchCategorySelect").val("");
  });


  //UZIMA IME I KRITERIJUM, UPOREDJUJE, I VRACA TRUE ILI FALSE
  function searchProductName(productName, criteria, categoryName) {

      var productNameLowerCase = productName.toLowerCase();
      var categoryNameLowerCase = categoryName.toLowerCase();
      
      var criteriaLowerCase = criteria.toLowerCase();
      
      

      var searchProductName = productNameLowerCase.search(criteriaLowerCase);
      var searchCategoryName = categoryNameLowerCase.search(criteriaLowerCase);

      if (searchProductName >= 0 || searchCategoryName >= 0) {
          return true;
      } else {
          return false;
      }
  }

  //EXIT PRODUCT BUTTON
  $("#exitProductBtn").click(function () {
      exitProduct();
  });

  //SAVE PRODUCT BUTTON  
  $("#saveProductBtn").click(function () {
      saveProduct();
  });

  function getTodayDate() {
      var MyDate = new Date();
      var MyDateString;

      MyDate.setDate(MyDate.getDate());

      MyDateString = ('0' + (MyDate.getMonth() + 1)).slice(-2) + '/' + ('0' + MyDate.getDate()).slice(-2) + '/' + MyDate.getFullYear();

      return MyDateString;
  }

  function getProductImage() {
      var imageName = $("#productImgInput").val();
      var imagePath = "images/app/products/" + imageName.slice(12);
      return imagePath;
  }



  //SAVE PRODUCT FN
  function saveProduct() {

      //var productImgInput = document.getElementById("productImgInput");
      var productTitleInput = document.getElementById("productTitleInput");
      var productPriceInput = document.getElementById("productPriceInput");
      var productCategorySelect = document.getElementById("productCategorySelect");
      var productDateAdded = document.getElementById("datepicker");
      var productImgInput = getProductImage();

      //if (testValidation(productImgInput, productTitleInput, productPriceInput, productCategorySelect, productDateAdded)) {

      var productId = document.getElementById("item-list-row").childElementCount + 1;

      var product = new Product(productId, productImgInput, productTitleInput.value, getProductCategoriesByCategoryID(productCategorySelect.value), productPriceInput.value, productDateAdded.value);

      product.CategoryID = productCategorySelect.value;

      products.push(product);
      newProduct(product);
      exitProduct();
      if (arrBucketFlag == true) {
          showBucket();
      }
  }


  //CREATE NEW PRODUCT
  function newProduct(product) {

      var itemListRowDiv = document.getElementById("item-list-row");

      var listDiv = document.createElement("DIV");
      listDiv.setAttribute("class", "col-xs-12 col-sm-6 col-md-4 col-lg-4 list");
      listDiv.setAttribute("id", "product" + product.ProductID);
      itemListRowDiv.appendChild(listDiv);


      var listLeftDiv = document.createElement("DIV");
      listLeftDiv.setAttribute("class", "list-left");
      listDiv.appendChild(listLeftDiv);

      var topBlockDiv = document.createElement("DIV");
      topBlockDiv.setAttribute("class", "top-block");
      listLeftDiv.appendChild(topBlockDiv);

      var topBlockImg = document.createElement("IMG");
      topBlockImg.setAttribute("class", "img-responsive");
      topBlockImg.setAttribute("src", product.ImagePath);
      topBlockImg.setAttribute("ONERROR", 'setRandomImagePath(this)');
      topBlockDiv.appendChild(topBlockImg);

      var bottomBlockDiv = document.createElement("DIV");
      bottomBlockDiv.setAttribute("class", "bottom-block");
      listLeftDiv.appendChild(bottomBlockDiv);

      var bottomBlockTitle2 = document.createElement("A");
      bottomBlockTitle2.setAttribute("href", "#");
      bottomBlockDiv.appendChild(bottomBlockTitle2);

      var bottomBlock2H4 = document.createElement("H4");
      bottomBlock2H4.setAttribute("id", "titleItem" + product.ProductID);
      bottomBlockTitle2.appendChild(bottomBlock2H4);
      bottomBlock2H4.innerHTML = product.ProductName;

      var priceBlockDiv = document.createElement("DIV");
      priceBlockDiv.setAttribute("class", "price-block");
      listLeftDiv.appendChild(priceBlockDiv);

      var priceBlockP = document.createElement("P");
      priceBlockP.setAttribute("class", "price-text");
      priceBlockDiv.appendChild(priceBlockP);
      priceBlockP.innerHTML = "Price: ";

      var priceBlockSpan = document.createElement("SPAN");
      priceBlockSpan.setAttribute("class", "priceValue");
      priceBlockSpan.setAttribute("id", "priceItem" + product.ProductID);
      priceBlockP.appendChild(priceBlockSpan);
      priceBlockSpan.innerHTML = Math.floor(product.UnitPrice);

      var priceBlockSpanD = document.createElement("SPAN");
      priceBlockSpanD.setAttribute("class", "priceDollar");
      priceBlockP.appendChild(priceBlockSpanD);
      priceBlockSpanD.innerHTML = "$";

      var quantityDiv = document.createElement("DIV");
      quantityDiv.setAttribute("class", "quantity");
      priceBlockDiv.appendChild(quantityDiv);

      var quantityP = document.createElement("P");
      quantityP.setAttribute("class", "paragraphItem");
      quantityDiv.appendChild(quantityP);
      quantityP.innerHTML = "Quantity: ";

      var quantityInput = document.createElement("INPUT");
      quantityInput.setAttribute("class", "quantityItem");
      quantityInput.setAttribute("id", "quantityItem" + product.ProductID);
      quantityInput.setAttribute("type", "number");
      quantityInput.setAttribute("min", "1");
      quantityInput.setAttribute("value", "1");
      quantityDiv.appendChild(quantityInput);

      var categoryDiv = document.createElement("DIV");
      categoryDiv.setAttribute("class", "category");
      priceBlockDiv.appendChild(categoryDiv);

      var categoryP = document.createElement("P");
      categoryDiv.appendChild(categoryP);
      categoryP.innerHTML = "Category: ";

      var categorySpan = document.createElement("SPAN");
      categorySpan.setAttribute("id", "categoryItem" + product.ProductID);
      categoryP.appendChild(categorySpan);
      categorySpan.innerHTML = product.CategoryName;

      var dateAddedDiv = document.createElement("DIV");
      dateAddedDiv.setAttribute("class", "date-added");
      priceBlockDiv.appendChild(dateAddedDiv);

      var dateAddedP = document.createElement("P");
      dateAddedP.setAttribute("class", "dateItem");
      dateAddedDiv.appendChild(dateAddedP);
      dateAddedP.innerHTML = "Added: ";

      var dateAddedSpan = document.createElement("SPAN");
      dateAddedSpan.setAttribute("id", "dateItem" + product.ProductID);
      dateAddedP.appendChild(dateAddedSpan);
      dateAddedSpan.innerHTML = product.CreationDate;

      var btnActionDiv = document.createElement("DIV");
      btnActionDiv.setAttribute("class", "btn-action");
      listLeftDiv.appendChild(btnActionDiv);

      var btnActionColDivS = document.createElement("DIV");
      btnActionColDivS.setAttribute("class", "col-xs-6 col-sm-6 col-md-6");
      btnActionDiv.appendChild(btnActionColDivS);

      var btnItemPlus = document.createElement("BUTTON");
      btnItemPlus.setAttribute("class", "btn btn-success btn-plus");
      btnItemPlus.setAttribute("id", "Item" + product.ProductID);
      btnItemPlus.setAttribute("onclick", "functionAdd(this)");
      btnActionColDivS.appendChild(btnItemPlus);

      var btnItemPlusI = document.createElement("I");
      btnItemPlusI.setAttribute("class", "fa fa-shopping-cart");
      btnItemPlusI.setAttribute("aria-hidden", "true");
      btnItemPlus.appendChild(btnItemPlusI);
      btnItemPlusI.innerHTML = "  +";

      var btnActionColDivM = document.createElement("DIV");
      btnActionColDivM.setAttribute("class", "col-xs-6 col-sm-6 col-md-6");
      btnActionDiv.appendChild(btnActionColDivM);

      var btnItemMinus = document.createElement("BUTTON");
      btnItemMinus.setAttribute("class", "btn btn-danger btn-minus");
      btnItemMinus.setAttribute("id", "Item" + product.ProductID);
      btnItemMinus.setAttribute("onclick", "functionSub(this)");
      btnActionColDivM.appendChild(btnItemMinus);

      var btnItemMinusI = document.createElement("I");
      btnItemMinusI.setAttribute("class", "fa fa-shopping-cart");
      btnItemMinusI.setAttribute("aria-hidden", "true");
      btnItemMinus.appendChild(btnItemMinusI);
      btnItemMinusI.innerHTML = "  -";

  }

  //PROVERAVA ISPRAVNOST UNETIH PARAMETARA U FORMI ZA KREIRANJE PROIZVODA
  function testValidation(img, title, price, category, date) {
      var chkValidityCounter = 0;
      var chkValidity = [img, title, price, category, date];

      for (i = 0; i < chkValidity.length; i++) {
          var chkValidityImg = chkValidity[i].id + "Validation";
          if (chkValidity[i].checkValidity() == true) {
              //document.getElementById(chkValidityImg).style.setProperty("display", "none");
              chkValidityCounter++;
          } else {
              //document.getElementById(chkValidityImg).style.setProperty("display", "block");
              chkValidityCounter--;
          }
      }

      if (chkValidityCounter == chkValidity.length) {
          return true;
      } else {
          return false;
      }
  }

  //PRAVI PROIZVOLJNU SLIKU
  function getRandomImagePath() {
      var radnomImageNumber = Math.floor(Math.random() * 20 + 1);
      var imagePath = "images/app/products/" + radnomImageNumber + ".png";
      return imagePath;
  }

  //POSTAVLJA PROIZVOLJNU SLIKU
  function setRandomImagePath(element) {
      element.src = getRandomImagePath();
  }


  //PREUZIMA PODATKE ZA SVAKI PROIZVOD
  function getProductData() {

      for (var product in products) {
          products[product].CategoryName = getProductCategoriesByCategoryID(products[product].CategoryID);
          products[product].ImagePath = getRandomImagePath();
          products[product].CreationDate = getTodayDate();
          newProduct(products[product]);
      }
  }

  //VRACA NAZIV KATEGORIJE NA OSNOVU ID-a
  function getProductCategoriesByCategoryID(CategoryID) {
      for (var category in categories) {
          if (categories[category].CategoryID == CategoryID) {
              var CategoryName = categories[category].CategoryName;
          }
      }
      return CategoryName;
  }

  //PREUZIMA SVE NAZIVE KATEGORIJA I DODAJE
  function getAllProductCategories(categorySelect) {
      for (var category in categories) {
          var CategoryID = categories[category].CategoryID;
          var CategoryName = categories[category].CategoryName;
          var categoryOption = document.createElement("OPTION");
          categoryOption.setAttribute("VALUE", CategoryID);
          categorySelect.appendChild(categoryOption);
          categoryOption.innerHTML = CategoryName;
      }
  }




  //KONSTRUKTORSKA FUNKCIJA
  function Product(ProductID, ImagePath, ProductName, CategoryName, UnitPrice, CreationDate) {
      this.ProductID = ProductID;
      this.ImagePath = ImagePath;
      this.ProductName = ProductName;
      this.CategoryName = CategoryName;
      this.UnitPrice = UnitPrice;
      this.CreationDate = CreationDate;
  }

  //PUNI COMBOBOXE SA NAZIVIMA KATEGORIJA
  function fillCategoryComboBox() {

      var categorySelect = $(".productCategorySelect");

      for (var element = 0; element < categorySelect.length; element++) {

          if (categorySelect[element].checkValidity() == false || categorySelect[element][0].value == "") {
              getAllProductCategories(categorySelect[element]);
          }
      }
  }

  //DUGME ZA AKTIVACIJU SEARCH PROZORA  
  //document.getElementById("openSearchForm").addEventListener("click", openSearchForm);

  //OTVARA SEARCH PROZOR  
  /*function openSearchForm() {
      $("#searchBar").fadeIn();
      //document.body.style.setProperty("overflow", "hidden");    
      document.getElementById("btnCollapseBar").setAttribute("aria-expanded", "false");
      document.getElementById("myNavbar").setAttribute("aria-expanded", "false");
      document.getElementById("myNavbar").setAttribute("class", "navbar-collapse collapse");
      document.getElementById("btnCollapseBar").setAttribute("class", "navbar-toggle collapsed");
      document.getElementById("searchCategorySelect").value = "";
      document.getElementById("criteriaInput").value = "";
  }*/

  //DUGME ZA DEAKTIVACIJU SEARCH PROZORA  
  //document.getElementById("btnCloseSearchForm").addEventListener("click", closeSearchForm);

  //ZATVARA SEARCH PROZOR  
  //function closeSearchForm() {
  //   $("#searchBar").fadeOut();
  // document.body.style.setProperty("overflow", "visible");
  //}