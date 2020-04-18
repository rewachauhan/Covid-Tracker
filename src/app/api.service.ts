import { Injectable } from '@angular/core';
import{ Http,Response} from '@angular/http';
import{ map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: Http){}

    // URL FOR THE SERVER
    private url="https://raw.githubusercontent.com/amcharts/covid-charts/master/data/json/world_timeline.json"
    private uri = "https://raw.githubusercontent.com/amcharts/covid-charts/master/data/json/total_timeline.json"
    // private url = "https://jsonplaceholder.typicode.com/todos/1"
    private ur = "https://corona.lmao.ninja/v2/historical"
    // FUNCTION FOR GETTING RESPONSE AND CONVERT TO JSON
    GetData(){
        return this.http.get(this.url)
        .pipe(map((res: Response) => res.json()))
    }
    addGetData(){
        return this.http.get(this.uri)
        .pipe(map((res: Response) => res.json()))
    }
    lineData(){
      return this.http.get(this.ur)
      .pipe(map((res: Response) => res.json()))
    }
}
