import { Component,OnInit, NgZone } from '@angular/core';
import { Chart } from 'chart.js';
import { NovelCovid } from "novelcovid";
import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
import { Label } from 'ng2-charts';
import am4geodata_worldLow from "@amcharts/amcharts4-geodata/worldLow";
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import {drawMap,drawMobileMap} from "@amcharts/amcharts4/custommap";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit{
  title = 'covid-app';

  classname="preload"
  classname1="postload"

  hide=true

  timeline
  covid_world_timeline
  covid_total_timeline

  bchart
  pchart
  lchart

  covid
  
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
  current="Loading..."

  states=[]

  activeColor = "#ff8726"
  confirmedColor ="#d21a1a"
  recoveredColor ="#45d21a"
  deathsColor = "#1c5fe5"

  constructor(private zone:NgZone){}
  public barChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,// We use these empty structures as placeholders for dynamic theming.
    scales: { xAxes: [{}], yAxes: [{}] },
    plugins: {
      datalabels: {
        anchor: 'end',
        align: 'end',
      }
    }
  };
  public barChartLabels: Label[] = ['Cases', 'Deaths', 'Recovered','Active'];
  public barChartType: ChartType = 'bar';
  public barChartLegend = true;
  public barChartPlugins = [pluginDataLabels];

  public barChartData: ChartDataSets[] = [
    { data: [], label:this.usercountry1, backgroundColor:"rgba(255,99,132,1)", borderColor:"rgba(255,99,132,1)"},
    { data: [], label:this.usercountry2, backgroundColor:"rgba(255,206,86,1)", borderColor:"rgba(255,206,86,1)" }
  ];


  ngOnInit(){
    this.covid=new NovelCovid()
    this.compare()
    this.getData()  
    this.piechart()
    this.linechart()
    drawMap()
    drawMobileMap()
    let ngJs: any;
        const ngFjs = document.getElementsByTagName('script')[0];
        const ngP = 'https';

        if (!document.getElementById('twitter-wjs')) {
          ngJs = document.createElement('script');
          ngJs.id = 'twitter-wjs';
          ngJs.src = ngP + '://platform.twitter.com/widgets.js';
          ngFjs.parentNode.insertBefore(ngJs, ngFjs);
        }
  }


  toggle(){
    this.hide=!this.hide;
  }


  piedata=[]
  piechart(){
    this.pchart = new Chart("pie", {
      type: 'pie',
      data: {
          labels: ['Active', 'Deaths', 'Recovered'],
          datasets: [{
              label: 'Covid-19 Cases',
              data:[1000,2000,3000],
              backgroundColor: [
                'rgba(255,135,38,1)', 
                'rgba(28,95,229,1)', 
                'rgba(69,210,26,1)' 
                
              ],
              borderColor: [ 
                this.activeColor,
                this.deathsColor,
                this.recoveredColor
              ],
              borderWidth: 1
          }]
      },
      options: {
        plugins: {
          datalabels: {
              display: false,
          },
      },
        responsive: true,
        maintainAspectRatio: false,
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
          labels: ['Days'],
          datasets: [{
              label: 'Active',
              data:this.linedata,
              borderColor: [ 
                this.activeColor,
                
              ],
              pointRadius: 3,
              pointStyle:"star",
              pointBorderColor:this.activeColor,

              borderWidth: 2
          },
          {
            label: 'Deaths',
            data:this.linedata,
            borderColor: [ 
              this.deathsColor,
              
            ],
            pointRadius: 3,
            pointStyle:"cross",
            pointBorderColor:this.deathsColor,

            borderWidth: 2
        },
        {
          label: 'Recovered',
          data:this.linedata,
          borderColor: [ 
            this.recoveredColor,
            
          ],
          pointRadius: 3,
          pointStyle:"circle",
          pointBorderColor:this.recoveredColor,

          borderWidth: 2
      }]
      },
      options: {
        plugins: {
          datalabels: {
              display: false,
          },
      },
        responsive: true,
        maintainAspectRatio:false,
        title: {
          display: true,
          text: 'Trend in the last 30 days'
        },legend: {
          position: 'top',
				},animation: {
					animateScale: true,
					animateRotate: true
				}
      },
  });
  }


  onchange(select){
    this.usercountry=select
    this.getData()
  }


  async getData(){
    var data =await this.covid.all()
    this.country= await this.covid.countries(this.usercountry)
    this.states = await this.covid.countryNames();
    this.timeline = await this.covid.historical(null, this.usercountry)
    this.dead=data.deaths
    this.recovered=data.recovered
    this.infected=data.cases
    this.current=data.active
    this.initData()
    this.compare()
  }


  point=[]
  initData(){

   
    this.piedata=[]
    this.piedata.push(this.country.active)
    this.piedata.push(this.country.deaths)
    this.piedata.push(this.country.recovered)
    this.pchart.data.datasets[0].data=this.piedata
    this.pchart.update()
    var temp=Object.values(this.timeline['timeline'].cases)
    var temp1=Object.values(this.timeline['timeline'].deaths)
    var temp2=Object.values(this.timeline['timeline'].recovered)
    this.point=[]
    for (let i = 0; i < temp.length; i++) {
      temp[i]= Number(temp[i]) - Number(temp1[i]) - Number(temp2[i]) 
      
    }
    for (let i = 0; i < temp.length; i++) {
      this.point.push(i+1)
      
    }
    this.lchart.data.datasets[0].data=temp
    this.lchart.data.datasets[1].data=Object.values(this.timeline['timeline'].deaths)
    this.lchart.data.datasets[2].data=Object.values(this.timeline['timeline'].recovered)
    this.lchart.data.labels=this.point
    this.lchart.update()

    
  }


  async compare(){
    var c1=await this.covid.countries(this.usercountry1)
    var c2=await this.covid.countries(this.usercountry2)
    this.bar1=[c1.cases,c1.deaths,c1.recovered,c1.active]
    this.bar2=[c2.cases,c2.deaths,c2.recovered,c2.active]
    this.barChartData[0].label=this.usercountry1
    this.barChartData[1].label=this.usercountry2
    this.barChartData[0].data=this.bar1
    this.barChartData[1].data=this.bar2

  }
  
 }