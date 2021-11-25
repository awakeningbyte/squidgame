import * as service from './service'
import  {Page} from './page'
import {Game} from './game'
const page = new Page()
const game = new Game(60, page)

service.run();



