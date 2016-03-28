from numpy import *
from pybrain.structure import *
from pybrain.datasets import *
from pybrain.supervised import *
from pybrain.tools.shortcuts import buildNetwork
from pybrain.tools.customxml import NetworkWriter, NetworkReader
import requests
import json
import schedule
import time

def getDataPoint():
    url = 'http://opendata.paris.fr/api/records/1.0/search/?dataset=stations-velib-disponibilites-en-temps-reel&q=15029'
    r = requests.get(url)
    if r.status_code != 200:
        return
    data = json.loads(r.content)
    sdata = data['records'][0]['fields']
    return float(sdata['available_bikes'])/(sdata['available_bikes']+sdata['available_bike_stands'])


print 'Welcome to veliBrain !'
print 'Loading network...'
net = NetworkReader.readFrom('net-15029.xml')
print 'Network loaded'

buff = [0] * 10 # Array containing 10 last recorded elements
counter = 0 # Counts how many recordings we are doing
predicted = 0

def job():
  global counter
  global predicted
  counter = counter + 1 
  dataPoint = getDataPoint()
  if counter > 10:
    print 'Real value for', counter, ' is ', dataPoint
    print 'Predicted value for', counter, ' was ', predicted
    print 'Difference: ', abs(predicted - dataPoint)
    print ''
    predicted = net.activate(buff)[0]

  buff.pop(0) # Remove first element of the array
  buff.append(dataPoint) # Add datapoint to last element of the array

# If I wanna use a scheduler I will use a scheduler okay ?
schedule.every(2).minutes.do(job) # Look at this beauty

while True:
      schedule.run_pending()
      time.sleep(1)

