!function() {

	var salary = {
			version: "1.0"
	};
	
		var margin = {
			top : 20,
			right : 20,
			bottom : 30,
			left : 60
		}, width = 960 - margin.left - margin.right, height = 300 - margin.top
				- margin.bottom;

		var y = d3.scale.ordinal().rangeRoundBands([0, height], .1);

		var x = d3.scale.linear().range([0, width]);

		var xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(20);

		var yAxis = d3.svg.axis().scale(y).orient("left").ticks(10);

		var svg = d3.select("#mainCompanyBar")
					.append("svg")
						.attr("width",	width + margin.left + margin.right + 60)
						.attr("height",	height + margin.top + margin.bottom + 60)
						.append("g")
						.attr("transform",	"translate(" + margin.left + "," + margin.top + ")");
		
		var data, barData;

				
		
		d3.csv("data/10CompanyFinancials.csv", function(error, _data) {
			data = _data.sort(function(a,b) {
				return Number(b.Revenue) - Number(a.Revenue);
			});
			
			computedValues();
			buildMainBarGraph();
		});
		
		
		function computedValues() {
			
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
						
		function buildMainBarGraph() {
			
			y.domain(data.map(function(d) {
				return d.Company;
			}));
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
					//.attr("transform",	"translate("+ width + margin.left + "," + height + ")")
					.attr("x", width - 50)
					.attr("y", 50)
					.attr("dx",	"2em")
					.attr("id","xAxisLabel")
					.style("text-anchor", "end")
					.text("Revenue (Billions)");

			var bars = svg.selectAll(".bar")
					.data(data)
    				.enter()
    				.append("rect")
					.attr("class", "bar")
					.style("opacity", function(d,i) {
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
				    .enter()
 				    .append("text")
 				    .attr("class", "barText")
					.attr("text-anchor", "middle")
					.attr("x",function(d) { return x(d.Revenue/1000);})
					.attr("y", function(d) { return y(d.Company);})
					.text(function(d) { return "";});
			

  				
  				//Create vertical bar chart
  				
  				
  				
  	            var svgBars = d3.select("#percentageCompanyBar")
  	            .append("svg")
  	                .attr("width",  width + margin.left + margin.right + 60)
  	                .attr("height", height + 200)
  	                .style("margin-left","50px")
  	                .append("g")
  	                .attr("transform",  "translate(" + margin.left + "," + margin.top + ")");
  				
  				
  				var lines = svgBars.append("line")
  				  .attr("x0",20)
  				  .attr("y0",120)
  				  .attr("x1",800)
  				  .attr("y1",120)
  				  .attr("stroke","black 2px solid");
  	            
  				barData = data.slice();
  				
  	            var gBars = svgBars.selectAll("g")
  	                .data(barData.sort(function(a,b) {
	    				return Number(b.Revenue) - Number(a.Revenue);
	    			}))
  	                .enter()
  	                .append("g");

  	            var columns = ["Revenue","Operating","PreTaxIncome","Income"];
  	            
  	            var color = d3.scale.category20();
  	            
  	            gBars.append("text")
  	             .attr("text-anchor", "middle")
  	                .attr("x", function(d,i) {
  	                    if (i > 4) {
  	                        return 40 + ((i - 5) * 180);
  	                    } else {
  	                        return 40 + (i * 180);  
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
  	             

  	            for (var j = 0; j < columns.length; j++) {
  	            	
  	            	var startX = j * 10; 
  	            	
  	                gBars
  	                .append("rect")
  	                .attr("height", function(d) {                    
  	                    var column = columns[j];
  	                    if (d[column]/d.Revenue < 0)
  	                        return 0;
  	                    return 100 * (d[column]/d.Revenue);          
  	                })
  	                .attr("width",15)
  	                .classed("masterCircle",true)
  	                .attr("x", function(d,i) {
  	                	if (i > 4) {
  	                		return ((i - 5) * 200) + startX;  	                	      	                		
  	                	} else {
  	                		return (i * 200) + startX;
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
					
        
		function sortBy(sortColumn, label, isCost) {

		    // Copy-on-write since tweens are evaluated after a delay.
		    
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

		    var transition = svg.transition().duration(1250),
		        delay = function(d, i) { return i * 50; };

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
           .attr("class", function() {
               if (isCost) {
                return "bar barCost";
               } else {
                return "bar";
               }
          })		        	
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
	        .call(xAxis)
	      .selectAll("g")
	        .delay(delay);
	 	    
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
	 	    	 	   
		}
			
		
		function sortByPerEmployee(sortColumn, label, isCost) {

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
	          .attr("class", function() {
	               if (isCost) {
	                return "bar barCost";
	               } else {
	                return "bar";
	               }
	          })		        
			.attr("width", function(d) {
				var amount = Number(d[sortColumn]);
				if (amount < 0) {
					amount = 0;
				}
				return x0(amount);
			});		        	

	 	    transition.select(".y.axis")
		        .call(yAxis)
		      .selectAll("g")
		        .delay(delay);
	 	    
			xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(10);
			
	 	    transition.select(".x.axis")
		        .call(xAxis)
		      .selectAll("g")
		        .delay(delay);
	 	    
            var transition2 = svg.transition().duration(1250),
            delay = function(d, i) { return i * 50; };
            
            
	 	    
 	 	    
	 	    transition2.selectAll(".barText")
	 	       .delay(delay)
               .attr("y", function(d) { 
                    return y0(d.Company) + 15; 
                })
                .attr("x", function(d) {
		            var amount = Number(d[sortColumn]);
		            if (amount < 0) {
		                amount = 0;
		            }
		            return x0(amount) - 30;                	
                })
	 	      .text(function(d) {
	 	    	 var amount = Number(d[sortColumn]);
	 	    	  if (sortColumn == "Salary100KEmp" && amount > 0) {
	 	    		  return ((100/d.PreTaxIncomeEmp).toPrecision(1) * 100) + "% of Pre-Tax Income";
	 	    	  } else {
	 	    		  return "";
	 	    	  }
	 	      })
	 	    
 	 	    d3.select("#xAxisLabel").text(label);


		}
		
		  d3.select("#sortByRevenue").on("click", function() { return sortBy("Revenue", "Revenue (Billions)", false); });
		  d3.select("#sortByCostOfRevenue").on("click", function() { return sortBy("Cost", "Cost of Revenue (Billions)", true); });
          d3.select("#sortByGrossProfit").on("click", function() { return sortBy("GrossProfit", "Gross Profit (Billions)", false); });
          d3.select("#sortByAdmin").on("click", function() { return sortBy("Admin", "Admin Cost (Billions)", true); });
          d3.select("#sortByRandD").on("click", function() { return sortBy("RandD", "R & D Cost (Billions)", true); });
		  d3.select("#sortByOperating").on("click", function() { return sortBy("Operating", "Operating Costs (Billions)", true); });
          d3.select("#sortByPreTaxIncome").on("click", function() { return sortBy("PreTaxIncome", "Pre-Tax Income (Billions)", false); });
          d3.select("#sortByTaxPaid").on("click", function() { return sortBy("TaxesPaid", "Tax Paid (Billions)", true); });
		  d3.select("#sortByIncome").on("click", function() { return sortBy("Income", "Income (Billions)", false); });
          d3.select("#sort100K").on("click", function() { return sortBy("Salary100K", "Cost of 100K Salary Increase (Billions)", false); });		  
		  
		  
		  d3.select("#sortRevenueEmployee").on("click", function() { return sortByPerEmployee("RevenueEmp", "Revenue Per Employee (Thousands)", false); });
          d3.select("#sortByCostOfRevenueEmployee").on("click", function() { return sortByPerEmployee("CostEmp", "Cost of Revenue  Per Employee (Thousands)", true); });
          d3.select("#sortByGrossProfitEmployee").on("click", function() { return sortByPerEmployee("GrossProfitEmp", "Gross Profit Per Employee (Thousands)", false); });
          d3.select("#sortByAdminEmployee").on("click", function() { return sortByPerEmployee("AdminEmp", "Admin Cost Per Employee (Thousands)", true); });
          d3.select("#sortByRandDEmployee").on("click", function() { return sortByPerEmployee("RandDEmp", "R & D Cost Per Employee (Thousands)", true); });
		  d3.select("#sortOperatingEmployee").on("click", function() { return sortByPerEmployee("OperatingEmp", "Operating Costs Per Employee (Thousands)", true); });
		  d3.select("#sortPreTaxIncomeEmployee").on("click", function() { return sortByPerEmployee("PreTaxIncomeEmp", "Pre-Tax Income Per Employee (Thousands)", false); });
          d3.select("#sortByTaxPaidEmployee").on("click", function() { return sortByPerEmployee("TaxesPaidEmp", "Tax Paid Per Employee (Thousands)", true); });
		  d3.select("#sortIncomeEmployee").on("click", function() { return sortByPerEmployee("IncomeEmp", "Income Per Employee (Thousands)", false); });
		  d3.select("#sort100KEmployee").on("click", function() { return sortByPerEmployee("Salary100KEmp", "Cost of 100K Salary Increase For Each Employee (Thousands)", false); });
		  
		  //This makes salary available to the world. amd is Asychronous Module Definition. When using the bang function convention
		  //to define this module you need to put the following block to to expose salary to the world.
		  if (typeof define === "function" && define.amd) 
			  define(salary); 
		  else if (typeof module === "object" && module.exports) 
			  module.exports = salary;
		  this.salary = salary;		  
		  
}();		  	