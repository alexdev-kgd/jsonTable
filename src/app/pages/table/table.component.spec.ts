import {TableComponent} from './table.component';
import {TableDataService} from './table-data.service';
import {TestBed} from '@angular/core/testing';

describe('TableComponent', () => {
  let tableData;
  let service: TableDataService;

  const json = '[{"name":"Name 1","year":"2010"},' +
  '{"name":"Name 2","year":"1997"},{"name":"Name 3","year":"2004"}]';

  beforeEach( () => {
    TestBed.configureTestingModule({
      providers: [TableDataService],
    });

    tableData = {
      checkData: jest.fn(),
    };

    service = TestBed.inject(TableDataService);
  });


  describe('ngOnInit', () => {
    it('should checkData to be called', () => {
      const checkData = jest.spyOn(tableData, 'checkData');
      tableData.checkData();
      expect(checkData).toHaveBeenCalledTimes(1);
    });
  });
  describe('Service', () => {
    it('should check saveJSON function to be called', () => {
      const saveJSON = jest.spyOn(service, 'saveJSON');
      service.saveJSON(json);
      expect(saveJSON).toHaveBeenCalledTimes(1);
    });

    it('should check loadJSON function value', () => {
      expect(service.loadJSON()).toBe(json);
    });
  });
  describe('', () => {});
});
