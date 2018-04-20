(function(s_except_gen) {

    // The global jQuery object is passed as a parameter
    s_except_gen(window.jQuery, window, document);

  }(function($, window, document) {

    // The $ is now locally scoped
    let selectedCategories = [];
   // Listen for the jQuery ready event on the document
   $(function() {

     // The DOM is ready!
     // get categoty tree layout
        const available_categories = categoryTree(categories);

        // show category tree when click on category box
        $('.seg-categories').on('click', (event)=>{
          if (event.target.id !=='includedCat')
          {

            $('#cat-source').length
              ?
                $('#cat-source').off().remove()
              :
                $(event.target).next().append(available_categories);
                checkDisabledList();
                $('#cat-source').on("click", "li" , (event)=>{
                    addCategoryToList(
                                      event.target,
                                      getCategoryItemHTML(event.target.id,event.target.innerText),
                                      event.target.id,
                                    );
                    checkDisabledList();
                    checkCategoriesSettings();
                });
          }
      });
          /**
           * Event handler for generate button
           *
           */
          $('#seg-generate').on('click',()=>{
            generateExcerpts();
          });
        // close category tree when click outside
        $('body').on('click',function (e) {

          if ($("#cat-source").length ) {

            if ( $(e.target).closest("#cat-source").length || $(e.target).closest('.seg-categories').length ) return;

                $('#cat-source').off().remove()

              }
        });
        // click event handler on selected category
        $('#includedCat').live('click', (event)=>{
                                                removeCategoryFromList(event.target);
                                                addRemoveToFromDisabledList($(event.target).attr('catid'));
                                                checkCategoriesSettings();
                                              });
      //settings change Event
        $('.setting').on('change',()=>checkCategoriesSettings());

   });
   //
   //function set chosen categories settings to hidden input
    function checkCategoriesSettings(){
      let included = [];
      let excluded = [];
      if($('#proceed'))
      {
        $('#proceed-btn').off();
        $('#proceed').remove();
      };
      $('.include-categoty-settings #includedCat').each((i,includedCategory)=>{

        included.push($(includedCategory).attr('catid'));

      });
      $('.exclude-categoty-settings #includedCat').each((i,includedCategory)=>{

        excluded.push($(includedCategory).attr('catid'));

      });
      $('#include-categories').val(included);
      $('#exclude-categories').val(excluded);

    }


   //_______________________________________________________

   //function to add category to list of choosen categories
   function addCategoryToList(currentItem,catItemToInsert,categoryToAddId){

     if(!$('.seg-categories span[catid='+$(catItemToInsert).attr("catid")+']').length)
        {
          $(currentItem).closest('.cat-tree').prev().append(catItemToInsert);
           addRemoveToFromDisabledList(categoryToAddId);
        }

   }
   //function to remove category from list of choosen categories
   //
    function removeCategoryFromList(cat){
      $(cat).remove();
    }
   //
   // function disable category when choosen
     function addRemoveToFromDisabledList(id){
       if (selectedCategories.includes(id)) {
              const index = selectedCategories.indexOf(id);
              selectedCategories.splice(index,1);
       }else{ selectedCategories.push(id)}
     }
     //function to add class disabled to selected categoties in categoryTree
     function checkDisabledList(){
       $.each(selectedCategories,(i,id)=>{
				$('li#'+id+'').addClass('disabled').removeClass('pointer');
			});
     }

   //returns html of single category in category tree
		function getCategoryItemHTML(id, name ){
			const html = '<span id="includedCat" catId="'+id+'" class=" pointer" >'+name+'</span>';
			return html;
		}
    /**
     * [generateExcerpts description]
     * @return {[type]} [description]
     */
    function generateExcerpts(){

      const settings = getSettings();
      const validation = validateSettings(settings);

      if (validation.pass)
        {

          const data = {
			                  'action'  : 'seg_count_posts_to_process',
			                  'type'    : settings.type,
                        'included': settings.included,
                        'excluded': settings.excluded,
                        'suffix'   : settings.suffix,
                        'words'   : settings.words
		                    };
          //check query settings and count results if any
          $.post(ajaxurl, data, function(response) {
                const postsNumber = parseInt(response,10);
            if (postsNumber > 0)
              {

                const proceedButton = `<div id="proceed">
                                        <label class="proceed-lbl" for="proceed-btn" >
                                          Current settings will generate <strong> ${response} </strong> excerpts
                                        </label>
                                        <button type="button" id="proceed-btn" class="seg-proceed">
                                          Proceed
                                        </button>
                                      </div>`;
                //if query returns posts count > 0 show count and proceed button
                if(!$('#proceed').length) $(".generate-button-container").after(proceedButton);
                $('button#proceed-btn').on('click',()=>proceedCreateExcerpts(data,postsNumber));
              }else{
                    const messages = [];
                    messages.push('No posts matched your settings: ' + response);
                    showMessages(messages,'warning');
            }
		        });

        }else{
          showMessages(validation.warnings,'danger');
        }
}
      //
      //
      function proceedCreateExcerpts(data,postsNumber){

        const postsPerIteration = 5;
        const iterationQuantity = Math.ceil(postsNumber/postsPerIteration);
        let iterationOffset = 0;
        data['action'] = 'seg_generate_excerpts';
        data['perPage'] = postsPerIteration;
        let guid = 0;

        if($('#proceed'))
        {
          $('#proceed-btn').off();
          $('#proceed').remove();
        };
        let progressSteps = '';
        const width = ((1/(iterationQuantity+1)) * 100).toFixed(3);
        for (i=0; i< iterationQuantity;i++)
          {
            progressSteps +=`<div id = "step${i+1}" class="progress-step" style="width:${width}%;"></div>`;
          }
        progressBar = `<div id="proceed">
                          <div id="progressBar">
                            ${progressSteps}
                          </div>
                       </div>`;
        $(".generate-button-container").after(progressBar);
          function run(data) {
            data['offset'] = guid  * postsPerIteration;
            guid++;
            const id = guid;

            return new Promise(resolve => {

              $.post(ajaxurl, data, function(response)
                          {

                          $(`#step${id}`).addClass('stepReady');
                           resolve(id);
                           iterationOffset+=id;
                           });
            });
          }

        const promise = Array.from({ length: iterationQuantity   }).reduce(function (acc) {
          return acc.then(function (res) {
            return run(data).then(function (result) {
              res.push(result);
              return res;
            });
          });
        }, Promise.resolve([]));

        promise.then(()=>{
          const messages = ['Excerpts have been successfully generated!']
          showMessages(messages,'success');
        }
        ).catch(error=>{console.log(error)});

      }

      //
      //
      function showMessages(messages,status){
        let messages_html = `<div id="proceed" class="${status}" ><ul class="messages">`;
        $(messages).each((i,message)=>{
          messages_html += `<li class="single-message"> ${message}</li>`;
        });
        messages_html += '</ul></div>';
        if(!$('#proceed').length)
            {
              $(".generate-button-container").after(messages_html);
            }else{
                  $('#proceed').remove();
                  $(".generate-button-container").after(messages_html);
                }
      }
    //
    function getSettings(){
      let settings ={};
      settings['type']     = $('#post-type-select').val();
      settings['included'] = $('#include-categories').val() !=='' ? $('#include-categories').val() : null;
      settings['excluded'] = $('#exclude-categories').val() !=='' ? $('#exclude-categories').val() : null;
      settings['suffix']    = $('#excerpt-suffix').val()!=='' ? $('#excerpt-suffix').val() : null;
      settings['words']    = $('#excerpt-words').val();
      return settings;
    }
    //
    //Validation
      function validateSettings(settings){
        let approved = [];
        let warnings  = [];
        suffixPattern = /^[a-zA-Z0-9,\s>.-]*$/;
        catpattern = /^[a-zA-Z0-9,]*$/;
        wordsPattern = /^[0-9]*$/;

        approved.push(suffixPattern.test(settings.type));

        if( settings.included !== null && !catpattern.test(settings.included))
            {
              approved.push(false);
              warnings.push('Incorrect value of included categories');
            }

        if( settings.excluded !== null && !catpattern.test(settings.excluded))
            {
              approved.push(false);
              warnings.push('Incorrect value of excluded categories');
            }

        if( settings.suffix   !== null && !suffixPattern.test(settings.suffix) )
            {
              approved.push(false);
              warnings.push('Forbidden characters detected in suffix');
            }

        if( settings.words === '' || !wordsPattern.test(settings.words) || parseInt(settings.words,10) < 1  )
            {
              approved.push(false);
              warnings.push('Number of words is required, and should contain only simple number > 1');
            }

        const pass = !approved.includes(false);

        return prsponse = {pass, warnings};
      }
    // _______________________________________________________
    //
   /* function to show category tree as a list of options
		returns children (html)
		@params
		categories  (json)

		 */
		function categoryTree(categories){
			const catlist = $.parseJSON(categories);
			if(catlist !== undefined){

				const parentCategoriesArray = {};
				const childCategoriesArray 	= [];
				let currCat={};
				$.each(catlist, (index,cat)=>{

						currCat[cat.cat_ID] = cat.cat_name;
					if (cat.category_parent === 0)
					{
						parentCategoriesArray[cat.cat_ID] = cat.cat_name;
					}else{
								if(childCategoriesArray[cat.category_parent] === undefined)
									{
										childCategoriesArray[cat.category_parent]=[];
									}

									childCategoriesArray[cat.category_parent].push(currCat);
					}
					currCat={};
				});

				let categoryHierarchyList = '<div id="cat-source"><ul>';
				$.each(parentCategoriesArray, (id,name)=>{
					categoryHierarchyList +='<li id="' + id + '" class="cat-item pointer"  >'
					+ name
					+ '</li>'
					+ checkChildren(id,childCategoriesArray,' ')
					+ '' ;
				});
				categoryHierarchyList += '</ul></div>';
				return categoryHierarchyList;

				/* function to check if category has children
				returns children (html)
				@params
				parent id (num)
				depth indicator(string)
				 */
				function checkChildren(id,childCategoriesArray,depth){
					if(childCategoriesArray[id] !== undefined)
						{
							depth+=' - ';
							let html='';
							$.each(childCategoriesArray[id], (i, child)=>{

								html+='<li id="'+Object.keys(child)[0]
								+
								'" class="cat-item pointer" >'
								+
								depth
								+
								child[Object.keys(child)[0]]
								+ '</li>'
								+
								checkChildren(Object.keys(child)[0],childCategoriesArray,depth)
								+ '';
							});
							return html;
						}
					return '';
				}
			}

			return '';
		}

  }
  ));
