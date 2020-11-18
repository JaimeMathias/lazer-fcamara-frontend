import { Component, OnInit, ViewChild } from '@angular/core';
import { QueueEntryHttpService } from './services/queue-entry-http.service';
import { MatStepper } from '@angular/material/stepper';

export interface Platforms {
  id: number;
  value: String; // in the angular doc example, it has a value and a viewValue, it seems like the value should be like an id
}

export interface PlatformQueue {
  id: number;
  queueCount: number;
}

@Component({
  selector: 'app-queue-entry',
  templateUrl: './queue-entry.component.html',
  styleUrls: ['./queue-entry.component.scss']
})
export class QueueEntryComponent implements OnInit {

  platforms: Platforms[]
  platformQueue: PlatformQueue[]
  
  selectedPlatform: Platforms
  
  buttonFilter: boolean = false

  userId: number = 0
  userPosition: number = 0

  constructor(
    private httpService: QueueEntryHttpService
  ) { }

  ngOnInit(): void {
    this.httpService.getPlatforms().subscribe(data => {
      this.platformQueue = [ ...data.queue ]
      this.platforms = [ ...data.platforms ]
    })
    
    setInterval(() => {
      this.httpService.getPlatformQueue().subscribe(data => {
        this.platformQueue = [ ...data.queue ] // Discuss if this is more efficient than doing a .map
      })
    }, 300000) // 5 minutes
  }

  @ViewChild('stepper') private myStepper: MatStepper;
  handlePlatformChange() {
    this.myStepper.next()
  }

  handleUserEnterQueue() {
    this.httpService.enterQueue(this.selectedPlatform).subscribe(data => {
      this.userPosition = data.userInfo.position
      this.buttonFilter = true
      this.myStepper.next()
      this.postStorageItem('userId', data.userInfo.id)
      this.userId = data.userInfo.id
    })
    setInterval(() => {
      this.httpService.getUserPosition(this.userId).subscribe(data => {
        this.userPosition = data.position
      })
    }, 60000)// 1 minute
  }

  handleUserQuitQueue() {
    this.userPosition = 0
    this.buttonFilter = false
    this.myStepper.reset()
  }

  postStorageItem(dataName: string, data) {
    localStorage.setItem(dataName, data)
  }

  getStorageItem(data: string) {
    localStorage.getItem(data)
  }
}
