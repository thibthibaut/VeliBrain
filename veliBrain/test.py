from numpy import *
from pybrain.structure import *
from pybrain.datasets import *
from pybrain.supervised import *
from pybrain.tools.shortcuts import buildNetwork
from pybrain.tools.customxml import NetworkWriter, NetworkReader

# net = FeedForwardNetwork()
# inLayer = LinearLayer(5)
# hiddenLayer1 = SigmoidLayer(8)
# hiddenLayer2 = SigmoidLayer(8)
# hiddenLayer3 = SigmoidLayer(8)
# outputLayer = LinearLayer(1)

# in_to_hidden1 =  FullConnection(inLayer, hiddenLayer1) 
# hidden1_to_hidden2 =  FullConnection(hiddenLayer1, hiddenLayer2) 
# hidden2_to_hidden3 = FullConnection(hiddenLayer2, hiddenLayer3) 
# hidden3_to_out = FullConnection(hiddenLayer3, outputLayer) 

# net.addInputModule(inLayer)
# net.addModule(hiddenLayer1)
# net.addModule(hiddenLayer2)
# net.addModule(hiddenLayer3)
# net.addOutputModule(outputLayer)

# net.addConnection( in_to_hidden1)
# net.addConnection(hidden1_to_hidden2)
# net.addConnection(hidden2_to_hidden3)
# net.addConnection(hidden3_to_out)

# net.sortModules()

# net = buildNetwork(10,100,100,100,100,100,1)
net = NetworkReader.readFrom('net-15029.xml')
# print net 

print net.activate([0.45, 0.46, 0.45, 0.45, 0.44, 0.40, 0.30, 0.24, 0.24, 0.22])

# data = loadtxt('station-15029.dat')
# data = [x/100 for x in data]
# ds = SupervisedDataSet(10,1)
# index = 0
# for sample in data:
#     if index > len(data) - 11 :
#         break
#     inputVector = [data[index], data[index+1], data[index+2],data[index+3],data[index+4], data[index+5],data[index+6],data[index+7],data[index+8],data[index+9],]
#     targetVector = [ data[index+10], ]
#     ds.addSample(inputVector, targetVector)
#     index += 1
    
# trainer = BackpropTrainer(net, ds)

# a = trainer.trainUntilConvergence(maxEpochs=50,verbose=True)

# print a
# NetworkWriter.writeToFile(net, 'net-15029.xml')
