import { Component,OnInit, NgZone } from '@angular/core';
import { Chart } from 'chart.js';
import { NovelCovid } from "novelcovid";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import * as am4maps from "@amcharts/amcharts4/maps";
import am4geodata_worldLow from "@amcharts/amcharts4-geodata/worldLow";


import am4themes_animated from "@amcharts/amcharts4/themes/animated";

/* Chart code */
// Themes begin
am4core.useTheme(am4themes_animated);

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'covid-app';
  bchart;
  pchart;
  lchart
  covid
  timeline
  country
  map
  bar1
  bar2
  usercountry="India"
  usercountry1="India"
  usercountry2="China"
  recovered="Loading..."
  dead="Loading..."
  infected="Loading..."
  states=[]
  constructor(private zone:NgZone){}
  ngAfterViewInit(){
    this.zone.runOutsideAngular(() => {
      let countryColor = am4core.color("#3b3b3b");
  let countryStrokeColor = am4core.color("#000000");
  let buttonStrokeColor = am4core.color("#ffffff");
  let countryHoverColor = am4core.color("#1b1b1b");
  let activeCountryColor = am4core.color("#0f0f0f");
      let mapChart = am4core.create("chartdiv",am4maps.MapChart);
      mapChart.height = am4core.percent(80);
      mapChart.zoomControl = new am4maps.ZoomControl();
      mapChart.zoomControl.align = "right";
      mapChart.zoomControl.marginRight = 15;
      mapChart.zoomControl.valign = "middle";
      mapChart.homeGeoPoint = { longitude: 0, latitude: -2 };

  // by default minus button zooms out by one step, but we modify the behavior so when user clicks on minus, the map would fully zoom-out and show world data
  // mapChart.zoomControl.minusButton.events.on("hit", showWorld);
  // // clicking on a "sea" will also result a full zoom-out
  // mapChart.seriesContainer.background.events.on("hit", showWorld);
  // mapChart.seriesContainer.background.events.on("over", resetHover);
  mapChart.seriesContainer.background.fillOpacity = 0;
  mapChart.zoomEasing = am4core.ease.sinOut;

  // https://www.amcharts.com/docs/v4/chart-types/map/#Map_data
  // you can use more accurate world map or map of any other country - a wide selection of maps available at: https://github.com/amcharts/amcharts4-geodata
  mapChart.geodata = am4geodata_worldLow;

  // Set projection
  // https://www.amcharts.com/docs/v4/chart-types/map/#Setting_projection
  // instead of Miller, you can use Mercator or many other projections available: https://www.amcharts.com/demos/map-using-d3-projections/
  mapChart.projection = new am4maps.projections.Miller();
  mapChart.panBehavior = "move";

  // when map is globe, beackground is made visible
  mapChart.backgroundSeries.mapPolygons.template.polygon.fillOpacity = 0.05;
  mapChart.backgroundSeries.mapPolygons.template.polygon.fill = am4core.color("#ffffff");
  mapChart.backgroundSeries.hidden = true;


  // Map polygon series (defines how country areas look and behave)
  let polygonSeries = mapChart.series.push(new am4maps.MapPolygonSeries());
  polygonSeries.dataFields.id = "id";
  polygonSeries.dataFields.value = "confirmedPC";
  polygonSeries.interpolationDuration = 0;

  polygonSeries.exclude = ["AQ"]; // Antarctica is excluded in non-globe projection
  polygonSeries.useGeodata = true;
  polygonSeries.nonScalingStroke = true;
  polygonSeries.strokeWidth = 0.5;
  // this helps to place bubbles in the visual middle of the area
  polygonSeries.calculateVisualCenter = true;
  polygonSeries.data = [];

  let polygonTemplate = polygonSeries.mapPolygons.template;
  // polygonTemplate.fill = [];
  polygonTemplate.fillOpacity = 1
  polygonTemplate.stroke = countryStrokeColor;
  polygonTemplate.strokeOpacity = 0.15
  polygonTemplate.setStateOnChildren = true;
  polygonTemplate.tooltipPosition = "fixed";

  // polygonTemplate.events.on("hit", handleCountryHit);
  // polygonTemplate.events.on("over", handleCountryOver);
  // polygonTemplate.events.on("out", handleCountryOut);


  polygonSeries.heatRules.push({
    "target": polygonTemplate,
    "property": "fill",
    "min": countryColor,
    "max": countryColor,
    "dataField": "value"
  })



  // you can have pacific - centered map if you set this to -154.8
  mapChart.deltaLongitude = -10;

  // polygon states
  let polygonHoverState = polygonTemplate.states.create("hover");
  polygonHoverState.transitionDuration = 1400;
  polygonHoverState.properties.fill = countryHoverColor;

  let polygonActiveState = polygonTemplate.states.create("active")
  polygonActiveState.properties.fill = activeCountryColor;

  // Bubble series
  let bubbleSeries = mapChart.series.push(new am4maps.MapImageSeries());  
  bubbleSeries.data = JSON.parse(JSON.stringify([]));

  bubbleSeries.dataFields.value = "confirmed";
  bubbleSeries.dataFields.id = "id";

  // adjust tooltip
  bubbleSeries.tooltip.animationDuration = 0;
  bubbleSeries.tooltip.showInViewport = false;
  bubbleSeries.tooltip.background.fillOpacity = 0.2;
  bubbleSeries.tooltip.getStrokeFromObject = true;
  bubbleSeries.tooltip.getFillFromObject = false;
  bubbleSeries.tooltip.background.fillOpacity = 0.2;
  bubbleSeries.tooltip.background.fill = am4core.color("#000000");

  let imageTemplate = bubbleSeries.mapImages.template;
  // if you want bubbles to become bigger when zoomed, set this to false
  imageTemplate.nonScaling = true;
  imageTemplate.strokeOpacity = 0;
  imageTemplate.fillOpacity = 0.55;
  imageTemplate.tooltipText = "{name}: [bold]{value}[/]";
  imageTemplate.applyOnClones = true;

  // imageTemplate.events.on("over", handleImageOver);
  // imageTemplate.events.on("out", handleImageOut);
  // imageTemplate.events.on("hit", handleImageHit);

  // this is needed for the tooltip to point to the top of the circle instead of the middle
  // imageTemplate.adapter.add("tooltipY", function(tooltipY, target) {
  //   return -target.children.getIndex(0).radius;
  // })

  // When hovered, circles become non-opaque  
  let imageHoverState = imageTemplate.states.create("hover");
  imageHoverState.properties.fillOpacity = 1;

  // add circle inside the image
  let circle = imageTemplate.createChild(am4core.Circle);
  // this makes the circle to pulsate a bit when showing it
  circle.hiddenState.properties.scale = 0.0001;
  circle.hiddenState.transitionDuration = 2000;
  circle.defaultState.transitionDuration = 2000;
  circle.defaultState.transitionEasing = am4core.ease.elasticOut;
  // later we set fill color on template (when changing what type of data the map should show) and all the clones get the color because of this
  circle.applyOnClones = true;

  // heat rule makes the bubbles to be of a different width. Adjust min/max for smaller/bigger radius of a bubble
  bubbleSeries.heatRules.push({
    "target": circle,
    "property": "radius",
    "min": 3,
    "max": 30,
    "dataField": "value"
  })

  // when data items validated, hide 0 value bubbles (because min size is set)
  bubbleSeries.events.on("dataitemsvalidated", function() {
    bubbleSeries.dataItems.each((dataItem) => {
      let mapImage = dataItem.mapImage;
      let circle = mapImage.children.getIndex(0);
      if (mapImage.dataItem.value == 0) {
        circle.hide(0);
      }
      else if (circle.isHidden || circle.isHiding) {
        circle.show();
      }
    })
  })

  // this places bubbles at the visual center of a country
  imageTemplate.adapter.add("latitude", function(latitude, target) {
    let polygon = polygonSeries.getPolygonById(target.dataItem.id);
    if (polygon) {
      target.disabled = false;
      return polygon.visualLatitude;
    }
    else {
      target.disabled = true;
    }
    return latitude;
  })

  imageTemplate.adapter.add("longitude", function(longitude, target) {
    let polygon = polygonSeries.getPolygonById(target.dataItem.id);
    if (polygon) {
      target.disabled = false;
      return polygon.visualLongitude;
    }
    else {
      target.disabled = true;
    }
    return longitude;
  })
  
      this.map = mapChart;
    });

  }
  ngOnInit(){
    this.covid=new NovelCovid()
    this.getData()  
    this.piechart()
    this.linechart()
    this.barchart()
  }
  barchart(){
    this.bchart = new Chart("bar", {
      type: 'bar',
      data: {
          labels: ['Cases', 'Deaths', 'Recovered','Active'],
          datasets: [{
              label: this.usercountry1,
              data: this.bar1,
              backgroundColor: [
                  'rgba(255, 99, 132, 0.2)',
                  'rgba(255, 99, 132, 0.2)',
                  'rgba(255, 99, 132, 0.2)',
                  'rgba(255, 99, 132, 0.2)',
                  
              ],
              borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(255, 99, 132, 1)',
                'rgba(255, 99, 132, 1)',
                'rgba(255, 99, 132, 1)',
                
              ],
              borderWidth: 1
          },
          {
            label: this.usercountry2,
            data: this.bar2,
            backgroundColor: [
              'rgba(255, 206, 86, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(255, 206, 86, 0.2)',              
            ],
            borderColor: [
              'rgba(255, 206, 86, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(255, 206, 86, 1)',
            ],
            borderWidth: 1
        }]
      },
      options: {
        onAnimationComplete: function (ctx) {

          var ctx = this.chart.ctx;
          ctx.font = this.scale.font;
          ctx.fillStyle = this.scale.textColor
          ctx.textAlign = "center";
          ctx.textBaseline = "bottom";
  
          this.datasets.forEach(function (dataset) {
              dataset.bars.forEach(function (bar) {
                  ctx.fillText(bar.value, bar.x, bar.y - 5);
              });
          })
      },
          scales: {
              yAxes: [{
                  ticks: {
                      beginAtZero: true
                  }
              }]
          },
          tooltips:{enabled:true}
      }
  });
  }
  piedata=[]
  piechart(){
    this.pchart = new Chart("pie", {
      type: 'pie',
      data: {
          labels: ['Active Cases', 'Deaths', 'Recovered'],
          datasets: [{
              label: 'Covid-19 Cases',
              data: this.piedata,
              backgroundColor: [
                  
                'rgba(54, 162, 235, .2)',
                'rgba(255, 206, 86, .2)',
                'rgba(153, 102, 255, .2)'
              ],
              borderColor: [ 
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(153, 102, 255, 1)'
              ],
              borderWidth: 1
          }]
      },
      options: {
        responsive: true,
        title: {
          display: true,
          text: 'Pie Chart'
        },legend: {
					position: 'top',
				},animation: {
					animateScale: true,
					animateRotate: true
				}
      },
  });
  }

  linedata=[]
  linechart(){
    this.lchart = new Chart("line", {
      type: 'line',
      data: {
          labels: ['Month'],
          datasets: [{
              label: 'Covid-19 Cases',
              data:this.linedata,
              backgroundColor: [
                  
                'rgba(54, 162, 235, .2)',
                // 'rgba(255, 206, 86, .2)',
                // 'rgba(153, 102, 255, .2)'
              ],
              borderColor: [ 
                'rgba(54, 162, 235, 1)',
                // 'rgba(255, 206, 86, 1)',
                // 'rgba(153, 102, 255, 1)'
              ],
              borderWidth: 1
          }]
      },
      options: {
        responsive: true,
        title: {
          display: true,
          text: 'Line Chart'
        },legend: {
					position: 'top',
				},animation: {
					animateScale: true,
					animateRotate: true
				}
      },
  });

  }
  async getData(){
    var data =await this.covid.all()
    this.country= await this.covid.countries(this.usercountry)
    this.timeline = await this.covid.historical(this.usercountry)
    this.states = await this.covid.countryNames();
    this.dead=data.deaths
    this.recovered=data.recovered
    this.infected=data.cases
    this.initData()
    this.compare()
  }
  point=[]
  initData(){
    this.piedata=[]
    this.piedata.push(this.country.active)
    this.piedata.push(this.country.deaths)
    this.piedata.push(this.country.recovered)
    var sum= this.piedata.reduce((a,b)=>a+b,0)
    this.piedata=this.piedata.map(function(x){return Math.round(x*100/sum)})
    this.pchart.data.datasets[0].data=this.piedata
    this.pchart.update()

    this.linedata=[]
    this.point=[]
    this.linedata=this.timeline.cases["3/13/20"]
    
    for (let i = 0; i < this.linedata.length; i++) {
      this.point.push(i+1)
    }
    this.lchart.data.datasets[0].data=this.linedata
    this.lchart.data.labels=this.point
    this.lchart.update()
    console.log(this.linedata)
  }

  async compare(){
    var c1=await this.covid.countries(this.usercountry1)
    var c2=await this.covid.countries(this.usercountry2)
    this.bar1=[c1.cases,c1.deaths,c1.recovered,c1.active]
    this.bar2=[c2.cases,c2.deaths,c2.recovered,c2.active]
    this.bchart.data.datasets[0].label=this.usercountry1
    this.bchart.data.datasets[1].label=this.usercountry2
    this.bchart.data.datasets[0].data=this.bar1
    this.bchart.data.datasets[1].data=this.bar2
    this.bchart.update()


  }
}