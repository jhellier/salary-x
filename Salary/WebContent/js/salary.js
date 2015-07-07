!function() {

/*
 * Salary is a set visualizations that show the ability of a company
 * to pay a higher salary without it adversely affecting the profitability.
 * There will be some companies that make so much profit that they can pay a higher salary
 * while others are so marginal that paying any more will lead to even more of
 * a loss. The highly profitable companies have a huge advantage which this visualization
 * shows they are not taking advantage of. 
 * 
 * 
 */	

	var salary = {
		version : "1.0"
	};
	
	
	/*
	 * Button Bars
	 */
	
	var companyButtons = [ {"id":"sortByRevenueColor","label":"Revenue"},
	                       {"id":"sortByCostOfRevenueColor","label":"Cost of Revenue"},
	                       {"id":"sortByGrossProfitColor","label":"Gross Profit"},
	                       {"id":"sortByAdminColor","label":"Admin"},
	                       {"id":"sortByRandDColor","label":"R &#38 D"},
	                       {"id":"sortByOperatingColor","label":"Operating Expenses"},
	                       {"id":"sortByPreTaxIncomeColor","label":"Pre-Tax Income"},
	                       {"id":"sortByTaxPaidColor","label":"Tax Paid"},
	                       {"id":"sortByIncomeColor","label":"Income"},
	                       {"id":"sort100KColor","label":"100K"}
	                       ];
	
	var companyButtonColor = d3.scale.category20();
	
	
	for (var i = 0; i < companyButtons.length; i++) {
		d3.select("#" + companyButtons[i].id).append("div")
			.style("background-color", companyButtonColor(i))
			.attr("class", "sortButton")
		
	}
	
			
		

	var margin = {
		top : 20,
		right : 20,
		bottom : 30,
		left : 60
	};

	var width = 960 - margin.left - margin.right;

	var height = 300 - margin.top - margin.bottom;

	var y = d3.scale.ordinal().rangeRoundBands([ 0, height ], .1);

	var x = d3.scale.linear().range([ 0, width ]);

	var xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(20);

	var yAxis = d3.svg.axis().scale(y).orient("left").ticks(10);

	var svg = d3.select("#mainCompanyBar").append("svg")
					.attr("width",	width + margin.left + margin.right + 60)
					.attr("height",	height + margin.top + margin.bottom + 25)
				.append("g")
					.attr("transform",	"translate(" + margin.left + "," + margin.top + ")");
		
	var data;

	var barData;


	/*
	 * All the values computed here are not stored in the
	 * DB because they are derived from values in the DB.
	 */
	function derivedValues() {
		
		data = data.map(function(d) {
			d.GrossProfit = (Number(d.Revenue) - Number(d.Cost));
		    d.TaxesPaid = (Number(d.PreTaxIncome) - Number(d.Income));
			d.RevenueEmp = (Number(d.Revenue)/Number(d.Employees)) * 1000;
			d.GrossProfitEmp = (Number(d.GrossProfit)/Number(d.Employees)) * 1000;
			d.AdminEmp = (Number(d.Admin)/Number(d.Employees)) * 1000;
			d.RandDEmp = (Number(d.RandD)/Number(d.Employees)) * 1000;
			d.OperatingEmp = (Number(d.Operating)/Number(d.Employees)) * 1000;
			d.PreTaxIncomeEmp = (Number(d.PreTaxIncome)/Number(d.Employees)) * 1000;
			d.IncomeEmp = (Number(d.Income)/Number(d.Employees)) * 1000;
            d.TaxesPaidEmp = d.PreTaxIncomeEmp - d.IncomeEmp;
            d.CostEmp = (Number(d.Cost)/Number(d.Employees)) * 1000;
            if (d.IncomeEmp <= 0 || d.PreTaxIncomeEmp <= 0) {
            	d.Salary100KEmp = 0;
            } else {
            	d.Salary100KEmp = (d.IncomeEmp/d.PreTaxIncomeEmp) * 100;	
            }
            d.Salary100K = (Number(d.Employees)/10);
            if (d.Salary100K < 0) {
            	d.Salary100K = 0;
            }
			return d;
		})
	}
	
	function make_x_axis20() {        
	    return d3.svg.axis().scale(x).orient("bottom").ticks(20);
	}
	
	function make_x_axis10() {        
	    return d3.svg.axis().scale(x).orient("bottom").ticks(10);
	}

	
	/*
	 * Builds the main set of horizontal bar graphs. This is the core of the viz and shows all
	 * the different views for all the group of companies. Each view is a financial category such
	 * as revenue or income or tax paid
	 */
	function buildMainBarGraph() {
		
		// Uses the list of companies to define the domain of the y axis.
		// There are ten companies so there will be ten ticks on the y axis
		y.domain(data.map(function(d) {
			return d.Company;
		}));
		
		// Derives the domain of the x axis from the company revenue. So the domain is from
		// 0 to the max revenue of all the companies. The DB stores the values as millions
		// We divide by 1000 to show the values as billions.
		x.domain([ 0, d3.max(data, function(d) {
			return Number(d.Revenue/1000);								
		}) ]);
		
		
		svg.append("g")
			.attr("class", "y axis")
			.attr("transform",	"translate("+ margin.left + ",0)")
			.call(yAxis);

		svg.append("g")
				.attr("class", "x axis")
				.attr("transform",	"translate("+ margin.left + "," + height  +   ")")
			.call(xAxis)
			.append("text")
				.attr("x", width - 50)
				.attr("y", 50)
				.attr("dx",	"2em")
				.attr("id","xAxisLabel")
				.style("text-anchor", "end")
				.text("Revenue (Billions)");
		
		svg.append("g")		
		        .attr("class", "grid")
		        .attr("transform", "translate(" + margin.left + "," + height + ")")
		        .call(make_x_axis20()
	            .tickSize(-height, 0, 0)
	            .tickFormat(""));
				
		
		
		// Uses .bar as the identifier. .bar does not have exist. It
		// can be a made up name just to reserve a place for each element in the data array.
		// In this case there is a css class defined as .bar but the selectAll could have
		// been any identifier and it would still work. It is always best to apply an
		// identifier to all appended elements because you have a distinct name to 
		// query for. If you left it as "rect" then selectAll("rect") would get you 
		// all the rects from a specific node in the DOM. 
		var bars = svg.selectAll(".bar")
				.data(data)
			.enter().append("rect")
				.attr("class", "bar")
				.style("fill", companyButtonColor(0))
				.style("opacity", function(d,i) {
					//Gives the candy cane effect on the rows
					if (i % 2 == 0) {
						return 0.5;
					} else {
						return 0.7;
					}
				})
				.attr("y", function(d) {
					return y(d.Company);
				})
				.attr("height", y.rangeBand())
				.attr("x", function(d) {
					return margin.left;
				})
				.attr("width", function(d) {
					return x(d.Revenue/1000);
				});
		
			svg.selectAll(".barText")
			    .data(data)
			   .enter().append("text")
			    .attr("class", "barText")
				.attr("text-anchor", "middle")
				.attr("x",function(d) { return x(d.Revenue/1000);})
				.attr("y", function(d) { return y(d.Company);})
				.text(function(d) { return "";});
		
	};
  				
	/*
	 *  Creates the vertical bar graphs. These are percentage views. There is one column that is
	 *  the target and the rest are shown as what percentage of that target. For example, if revenue
	 *  is the target and the other columns are cost and income then revenue is shown as 100% and 
	 *  cost is shown as cost/revenue and income is shown as income/revenue.
	 */		
	function buildPercentageBarGraphs() {
		
            var svgBars = d3.select("#percentageCompanyBar").append("svg")
                .attr("width",  width + margin.left + margin.right + 60)
                .attr("height", height + 100)
                .style("margin-left","50px")
               .append("g")
                .attr("transform",  "translate(" + margin.left + "," + margin.top + ")");
			
			var lineData = [100,75,50,25,0];
			
			percentLines(svgBars, lineData, 20, -20);
			percentLines(svgBars, lineData, 200, -20);
			
			percentLabels(svgBars, lineData, 24, -40);
			percentLabels(svgBars, lineData, 24, 885);
			percentLabels(svgBars, lineData, 200, -40);
			percentLabels(svgBars, lineData, 200, 885);
			
			
            var gBars = svgBars.selectAll("g")
                .data(barData.sort(function(a,b) {
    				return Number(b.Revenue) - Number(a.Revenue);
    			}))
    			.enter().append("g");

            var columns = ["Revenue","Cost","GrossProfit","Admin","RandD","Operating","PreTaxIncome","TaxesPaid","Income","Salary100K"];
            
            var color = d3.scale.category20();
            
            //Company names are placed at the bottom of each vertical bar graph
            gBars.append("text")
             .classed("barGraphCompanyText",true)
             .attr("text-anchor", "middle")
                .attr("x", function(d,i) {
                    if (i > 4) {
                        return 40 + ((i - 5) * 190);
                    } else {
                        return 40 + (i * 190);  
                    }
                    
                })
                .attr("y", function(d,i) {
                    if (i > 4) {
                        return 320;
                    } else {
                        return 140;
                    }
                })
                .text(function(d) { return d.Company;})
             

            // Walks through the columns and puts one bar per graph on each pass.
            // I imagine there are cleaner ways of doing this but this works for now.    
            for (var j = 0; j < columns.length; j++) {
            	
            	var startX = j * 10; 
            	
                gBars.append("rect")
                .attr("height", function(d) {                    
                    var column = columns[j];
                    if (d[column]/d.Revenue < 0)
                        return 0;
                    return 100 * (d[column]/d.Revenue);          
                })
                .attr("width",15)
                .classed("barGraphCompanyRect",true)
                .attr("x", function(d,i) {
                	if (i > 4) {
                		return ((i - 5) * 185) + startX;  	                	      	                		
                	} else {
                		return (i * 185) + startX;
                	}
                })
                .attr("y", function(d,i) {
                    var column = columns[j];
                    if (d[column]/d.Revenue < 0)
                        return 0;
                    var yPos = 100 * (d[column]/d.Revenue);          

                	
                    if (i > 4) {
                    	return 300 - yPos;  	                        
                    } else {
                    	return 120 - yPos;
                    }
                })
                .style("fill", function(d) {
                    return color(columns[j]);
                });
                
            }
       
	};  
	
	
	/*
	 * Adds percent lines to the background of the bar graph. The lines
	 * extend the complete width of the group of bar graphs.
	 */
	function percentLines(parent, data, yBase, xBase) {

		parent.selectAll(".percentLines")
			   .data(data)
			.enter().append("line")
			  .attr("x1",xBase)
			  .attr("y1", function(d,i) {
				  return yBase + (i * 25); 
			  })
			  .attr("x2",870)
			  .attr("y2", function(d,i) {
				  return yBase + (i * 25); 
			  })
			  .attr("stroke","black")
			  .attr("stroke-width", "1px")
			  .attr("stroke-opacity", 0.2);
	
	}
	
	
	function percentLabels(parent, data, yBase, xBase) {
			parent.selectAll(".percentLabels")
				.data(data)					
			.enter().append("text")
				.attr("x", xBase)
				.attr("y", function(d,i) {
					return yBase + (i * 25);
				})
				.text(function(d) {
					return d + "%";
				})
				.style("font-size","11px")
				.attr("text-anchor", "middle")
		
	}
	
	var barColors = d3.scale.category20();
	
	for (var i = 0; i < 10; i++) {
		barColors(i);
	}
					
        /*
         * Sorts based on the chosen column. isCost is used to change the color green for in flows like Revenue
         * and red for out flows like Operating Costs.
         */
		function sortBy(sortColumn, label, isCost, colorStream) {

		    // Copy-on-write since tweens are evaluated after a delay.
			// This set of function calls has a lot going on. First you apply a sort
			// to the target column. Then you map the y domain to the company column.
			// Then you copy the whole thing and put it in y0.
		    var y0 = y.domain(data.sort(function(a,b) {
		    				return Number(b[sortColumn]) - Number(a[sortColumn]);
		    			})
			        .map(function(d) { return d.Company; }))
			        .copy();
		    
		    var x0 = x.domain([ 0, d3.max(data, function(d) {
		    	var amount = Number(d[sortColumn])/1000;
				if (amount < 0) {
					amount = 0;
				}
				return amount;
			}) ]);
		    
		    svg.selectAll(".bar")
		        .sort(function(a, b) { return y0(a.Company) - y0(b.Company); });

		    var transition = svg.transition().duration(1250);
		    
		    // This is passed to the delay function of a selection. Therefore it
		    // steps through the data array, hence the use of d and i.
		    var delay = function(d, i) { return i * 50; };

		    transition.selectAll(".bar")
		        .delay(delay)
		        .attr("y", function(d) { 
		        	return y0(d.Company); 
		        	})
                    .style("opacity", function(d,i) {
                        if (i % 2 == 0) {
                            return 0.5;
                        } else {
                            return 0.7;
                        }
                    })
                    
           .style("fill",barColors(colorStream))         
			.attr("width", function(d) {

					var amount = Number(d[sortColumn])/1000;
					if (amount < 0) {
						amount = 0;
					}
					return x0(amount);
				});			        	

	 	    transition.select(".y.axis")
		        .call(yAxis)
		      .selectAll("g")
		        .delay(delay);
	 	    
	 	   xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(20);	 	    
	 	    
	 	    transition.select(".x.axis")
	        .call(xAxis);
/*	      .selectAll("g")
	        .delay(delay);
*/	 	    
	 	    
			transition.select(".grid")
	        .call(make_x_axis20()
            .tickSize(-height, 0, 0)
            .tickFormat(""));
	 	    
            transition.selectAll(".barText")
            .delay(delay)
            .attr("y", function(d) { 
                 return y0(d.Company) + 15; 
             })
             .attr("x", function(d) {
            	 var amount = Number(d[sortColumn])/1000;
                 if (amount < 0) {
                     amount = 0;
                 }
                 return x0(amount) - 30;                 
             })
           .text(function(d) {
                   return "";
           })	 	    
	 	    
	 	    
	 	   d3.select("#xAxisLabel").text(label);
            
            sortPercentageBarGraph(sortColumn);
            
		}
		
		
		function sortPercentageBarGraph(sortColumn) {
 		
			var svgBarGraph = d3.select("#percentageCompanyBar").selectAll("g g")
				.sort(function(a,b) {
					return Number(b[sortColumn]/b.Revenue) - Number(a[sortColumn]/a.Revenue);
				}) 
			
			var delay = function(d, i) { return i * 50; };
			
			var transition = svgBarGraph.transition().duration(1250);
			
			var j = -1;
			var k = -1;
		    transition.selectAll(".barGraphCompanyText")
		    	.delay(delay)
                .attr("x", function(d) {
                    j++;

                    if (j > 4) {
                        return 40 + ((j - 5) * 190);
                    } else {
                        return 40 + (j * 190);  
                    }                    
                    
                })
                .attr("y", function(d) {
                	k++;
                    if (k > 4) {
                        return 320;
                    } else {
                        return 140;
                    }

                });
		    

		    var startX = 0;
		    var barXPos = 0;
		    var groupCount = transition.selectAll(".barGraphCompanyRect").length;
		   
		    
		   transition.selectAll(".barGraphCompanyRect").each(function(d,i) {
			   	
			   	if (i == 0) {
			   		barXPos = 0;
			   		
				    if (groupCount == 5 || groupCount == 10) {
				   		startX = 0;
				   	} else {
				   		startX = startX + 185;
				   	}	   		
			   		
			   		groupCount--;
			   		
			   	} else {
			   		barXPos += 10;
			   	}
			   	
			   	
			   	
			   	
	            d3.select(this)
	            .attr("x", function() {
	            		return startX + barXPos;
	            })
	            .attr("y", function() {
	            	var yPos = this.height.baseVal.value;
	            	if (groupCount < 5) {
	                	return 300 - yPos;  	                        
	                } else {
	                	return 120 - yPos;
	                }
	            })                	
	            

			   
		   })
		   
			
		}
			
		
		function sortByPerEmployee(sortColumn, label, isCost, colorStream) {

			
		    // Copy-on-write since tweens are evaluated after a delay.
		    var y0 = y.domain(data.sort(function(a,b) {
							return Number(b[sortColumn]) - Number(a[sortColumn]);
						})
			        .map(function(d) { return d.Company; }))
			        .copy();
		    
		    var x0 = x.domain([ 0, d3.max(data, function(d) {
				var amount = Number(d[sortColumn]);
				if (amount < 0) {
					amount = 0;
				}
				return amount;
			}) ]);

 		    svg.selectAll(".bar")
		        .sort(function(a, b) { return y0(a.Company) - y0(b.Company); });

		    var transition = svg.transition().duration(1250);
		        
		    var delay = function(d, i) { return i * 50; };

	 	    transition.select(".y.axis")
		        .call(yAxis)
		        .selectAll("g")
		        .delay(delay);
 	    
		xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(10);
		
		transition.select(".x.axis")
		        .call(xAxis);
/*		        .selectAll("g")
		        .delay(delay);
*/		
		transition.select(".grid")
	        .call(make_x_axis10()
	        .tickSize(-height, 0, 0)
	        .tickFormat(""));
		

 	    transition.selectAll(".bar")
		        .delay(delay)
		        .attr("y", function(d) { 
		        	return y0(d.Company); 
		        })
                .style("opacity", function(d,i) {
                    if (i % 2 == 0) {
                        return 0.5;
                    } else {
                        return 0.7;
                    }
                })		        
            .style("fill",barColors(colorStream))		        
			.attr("width", function(d) {
				var amount = Number(d[sortColumn]);
				if (amount < 0) {
					amount = 0;
				}
				return x0(amount);
			});		        	

	 	    
            var transition2 = svg.transition().duration(1250),
            delay = function(d, i) { return i * 50; };
            
            
	 	    
 	 	    
	 	    transition2.selectAll(".barText")
	 	       .delay(delay)
               .attr("y", function(d) { 
                    return y0(d.Company) + 15; 
                })
                .attr("x", function(d) {
		            var amount = Number(d[sortColumn]);
		            if (amount <= 0) {
		                amount = 15;
		            }
		            return x0(amount) - 30;                	
                })
	 	      .text(function(d) {
	 	    	 var amount = Number(d[sortColumn]);
	 	    	  if (sortColumn == "Salary100KEmp" && amount > 0) {
	 	    		  return ((100/d.PreTaxIncomeEmp).toPrecision(1) * 100) + "% of Pre-Tax Income";
	 	    	  } else if (sortColumn == "Salary100KEmp") {
	 	    		  //return "Insufficient Income";
	 	    		  return ""; //Not sure that this looks good with the above text. Very controversial to put there too
	 	    	  } else {
	 	    		  return "";
	 	    	  }
	 	      })
	 	    
 	 	    d3.select("#xAxisLabel").text(label);

	 	   sortPercentageBarGraph(sortColumn.split("Emp")[0]);
		}
		
		  d3.select("#sortByRevenue").on("click", function() { return sortBy("Revenue", "Revenue (Billions)", false, 0); });
		  d3.select("#sortByCostOfRevenue").on("click", function() { return sortBy("Cost", "Cost of Revenue (Billions)", true, 1); });
          d3.select("#sortByGrossProfit").on("click", function() { return sortBy("GrossProfit", "Gross Profit (Billions)", false, 2); });
          d3.select("#sortByAdmin").on("click", function() { return sortBy("Admin", "Admin Cost (Billions)", true, 3); });
          d3.select("#sortByRandD").on("click", function() { return sortBy("RandD", "R & D Cost (Billions)", true, 4); });
		  d3.select("#sortByOperating").on("click", function() { return sortBy("Operating", "Operating Costs (Billions)", true, 5); });
          d3.select("#sortByPreTaxIncome").on("click", function() { return sortBy("PreTaxIncome", "Pre-Tax Income (Billions)", false, 6); });
          d3.select("#sortByTaxPaid").on("click", function() { return sortBy("TaxesPaid", "Tax Paid (Billions)", true, 7); });
		  d3.select("#sortByIncome").on("click", function() { return sortBy("Income", "Income (Billions)", false, 8); });
          d3.select("#sort100K").on("click", function() { return sortBy("Salary100K", "Cost of 100K Salary Increase (Billions)", false, 9); });		  
		  
		  
		  d3.select("#sortRevenueEmployee").on("click", function() { return sortByPerEmployee("RevenueEmp", "Revenue Per Employee (Thousands)", false, 0); });
          d3.select("#sortByCostOfRevenueEmployee").on("click", function() { return sortByPerEmployee("CostEmp", "Cost of Revenue  Per Employee (Thousands)", true, 1); });
          d3.select("#sortByGrossProfitEmployee").on("click", function() { return sortByPerEmployee("GrossProfitEmp", "Gross Profit Per Employee (Thousands)", false, 2); });
          d3.select("#sortByAdminEmployee").on("click", function() { return sortByPerEmployee("AdminEmp", "Admin Cost Per Employee (Thousands)", true, 3); });
          d3.select("#sortByRandDEmployee").on("click", function() { return sortByPerEmployee("RandDEmp", "R & D Cost Per Employee (Thousands)", true, 4); });
		  d3.select("#sortOperatingEmployee").on("click", function() { return sortByPerEmployee("OperatingEmp", "Operating Costs Per Employee (Thousands)", true, 5); });
		  d3.select("#sortPreTaxIncomeEmployee").on("click", function() { return sortByPerEmployee("PreTaxIncomeEmp", "Pre-Tax Income Per Employee (Thousands)", false, 6); });
          d3.select("#sortByTaxPaidEmployee").on("click", function() { return sortByPerEmployee("TaxesPaidEmp", "Tax Paid Per Employee (Thousands)", true, 7); });
		  d3.select("#sortIncomeEmployee").on("click", function() { return sortByPerEmployee("IncomeEmp", "Income Per Employee (Thousands)", false, 8); });
		  d3.select("#sort100KEmployee").on("click", function() { return sortByPerEmployee("Salary100KEmp", "Cost of 100K Salary Increase For Each Employee (Thousands)", false, 9); });
		  
		  
  		d3.csv("data/10CompanyFinancials.csv", function(error, _data) {
				data = _data.sort(function(a,b) {
					return Number(b.Revenue) - Number(a.Revenue);
				});
				
				//Copy the data to barData so that it can be changed independently
				barData = data.slice();
				
				derivedValues();
				buildMainBarGraph();
				buildPercentageBarGraphs();
			});

		  
		  //This makes salary available to the world. amd is Asynchronous Module Definition. When using the bang function convention
		  //to define this module you need to put the following block to to expose salary to the world.
		  if (typeof define === "function" && define.amd) 
			  define(salary); 
		  else if (typeof module === "object" && module.exports) 
			  module.exports = salary;
		  this.salary = salary;		  
		  
}();		  	